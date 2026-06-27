import { Router } from 'express';
import { db } from '../db/connection';
import { artworks, artworkCategories, categories } from '../db/schema';
import { eq, or, and, inArray, exists, desc, count, SQL, ilike } from 'drizzle-orm';
import { upload } from '../middleware/upload';
import { uploadToR2 } from '../services/r2';
import { authenticateToken } from '../middleware/auth';
import { parseCategoryIds } from '../utils/categories';

const router = Router();

async function getArtworkWithCategories(artworkIdOrSlug: number | string) {
  const isNumeric = typeof artworkIdOrSlug === 'number' || /^\d+$/.test(artworkIdOrSlug.toString());

  const result = await db.query.artworks.findFirst({
    where: isNumeric
      ? eq(artworks.id, typeof artworkIdOrSlug === 'number' ? artworkIdOrSlug : parseInt(artworkIdOrSlug))
      : eq(artworks.slug, artworkIdOrSlug.toString()),
    with: {
      artworkCategories: {
        with: {
          category: true
        }
      }
    }
  });

  if (!result) return null;

  return {
    ...result,
    artwork_categories: result.artworkCategories.map(ac => ({
      category: ac.category
    }))
  };
}

// Get all artworks
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = req.query.search as string || '';
    const categoryIds = req.query.categoryIds as string || '';
    const type = req.query.type as string || '';

    const offset = (page - 1) * limit;

    const conditions: (SQL | undefined)[] = [];

    if (search.trim()) {
      conditions.push(or(
        ilike(artworks.title, `%${search}%`),
        ilike(artworks.description, `%${search}%`)
      ));
    }

    if (type.trim() && (type === 'portfolio' || type === 'scratch')) {
      conditions.push(eq(artworks.type, type));
    }

    conditions.push(eq(artworks.published, true));

    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          conditions.push(exists(
            db.select()
              .from(artworkCategories)
              .where(and(
                eq(artworkCategories.artwork_id, artworks.id),
                inArray(artworkCategories.category_id, categoryIdArray)
              ))
          ));
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const totalResult = await db.select({ value: count() }).from(artworks)
      .where(whereClause);
    const total = totalResult[0].value;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const artworksList = await db.query.artworks.findMany({
      where: whereClause,
      with: {
        artworkCategories: {
          with: {
            category: true
          }
        }
      },
      limit,
      offset,
      orderBy: [desc(artworks.created_at)]
    });

    const formattedData = artworksList.map(a => ({
      ...a,
      artwork_categories: a.artworkCategories.map(ac => ({
        category: ac.category
      }))
    }));

    res.status(200).json({
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching artworks:', error);
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
});

// Get artworks by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = req.query.search as string || '';
    const categoryIds = req.query.categoryIds as string || '';
    const type = req.query.type as string || '';

    const offset = (page - 1) * limit;

    const conditions: (SQL | undefined)[] = [];
    conditions.push(eq(artworks.user_id, parseInt(userId)));

    if (search.trim()) {
      conditions.push(or(
        ilike(artworks.title, `%${search}%`),
        ilike(artworks.description, `%${search}%`)
      ));
    }

    if (type.trim() && (type === 'portfolio' || type === 'scratch')) {
      conditions.push(eq(artworks.type, type));
    }

    conditions.push(eq(artworks.published, true));

    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          conditions.push(exists(
            db.select()
              .from(artworkCategories)
              .where(and(
                eq(artworkCategories.artwork_id, artworks.id),
                inArray(artworkCategories.category_id, categoryIdArray)
              ))
          ));
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const totalResult = await db.select({ value: count() }).from(artworks)
      .where(whereClause);
    const total = totalResult[0].value;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const artworksList = await db.query.artworks.findMany({
      where: whereClause,
      with: {
        artworkCategories: {
          with: {
            category: true
          }
        }
      },
      limit,
      offset,
      orderBy: [desc(artworks.created_at)]
    });

    const formattedData = artworksList.map(a => ({
      ...a,
      artwork_categories: a.artworkCategories.map(ac => ({
        category: ac.category
      }))
    }));

    res.status(200).json({
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user artworks:', error);
    res.status(500).json({ error: 'Failed to fetch user artworks' });
  }
});

// Get current user's artworks
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = req.query.search as string || '';
    const categoryIds = req.query.categoryIds as string || '';
    const type = req.query.type as string || '';

    const offset = (page - 1) * limit;

    const conditions: (SQL | undefined)[] = [];
    conditions.push(eq(artworks.user_id, userId));

    if (search.trim()) {
      conditions.push(or(
        ilike(artworks.title, `%${search}%`),
        ilike(artworks.description, `%${search}%`)
      ));
    }

    if (type.trim() && (type === 'portfolio' || type === 'scratch')) {
      conditions.push(eq(artworks.type, type));
    }

    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          conditions.push(exists(
            db.select()
              .from(artworkCategories)
              .where(and(
                eq(artworkCategories.artwork_id, artworks.id),
                inArray(artworkCategories.category_id, categoryIdArray)
              ))
          ));
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const totalResult = await db.select({ value: count() }).from(artworks)
      .where(whereClause);
    const total = totalResult[0].value;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const artworksList = await db.query.artworks.findMany({
      where: whereClause,
      with: {
        artworkCategories: {
          with: {
            category: true
          }
        }
      },
      limit,
      offset,
      orderBy: [desc(artworks.created_at)]
    });

    const formattedData = artworksList.map(a => ({
      ...a,
      artwork_categories: a.artworkCategories.map(ac => ({
        category: ac.category
      }))
    }));

    res.status(200).json({
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching artworks:', error);
    res.status(500).json({ error: 'Failed to fetch artworks' });
  }
});

// Get artwork by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isNumeric = /^\d+$/.test(id);
    const artwork = await db.query.artworks.findFirst({
      where: and(
        isNumeric ? eq(artworks.id, parseInt(id)) : eq(artworks.slug, id),
        eq(artworks.published, true)
      ),
      with: {
        artworkCategories: {
          with: {
            category: true
          }
        }
      }
    });

    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    const formatted = {
      ...artwork,
      artwork_categories: artwork.artworkCategories.map(ac => ({
        category: ac.category
      }))
    };

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching artwork:', error);
    res.status(500).json({ error: 'Failed to fetch artwork' });
  }
});


// Create Artwork
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const title = req.body?.title || null;
    const description = req.body?.description || null;
    const type = req.body?.type || 'portfolio';
    const published = req.body?.published !== undefined ? req.body.published === 'true' || req.body.published === true : true;
    const categoryIds = req.body?.categoryIds || null;
    const slug = req.body?.slug || null;
    const file = req.file;
    const userId = req.user?.userId;

    if (!file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (type && !['portfolio', 'scratch'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "portfolio" or "scratch"' });
    }

    const username = req.user?.username!;
    const r2Result = await uploadToR2(file.buffer, file.originalname, username, 'artworks');

    const inserted = await db.insert(artworks)
      .values({
        image_path: r2Result.url,
        title,
        description,
        type,
        published,
        user_id: userId,
        slug: slug!,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();

    const createdArtwork = inserted[0];

    const parsedIds = parseCategoryIds(categoryIds);
    if (parsedIds.length > 0) {
      const values = parsedIds.map((categoryId: number) => ({
        artwork_id: createdArtwork.id,
        category_id: categoryId
      }));
      await db.insert(artworkCategories).values(values);
    }

    const artwork = createdArtwork;

    const formattedArtwork = await getArtworkWithCategories(artwork.id);
    res.status(201).json(formattedArtwork);
  } catch (error) {
    console.error('Error creating artwork:', error);
    res.status(500).json({
      error: 'Failed to create artwork',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update Artwork
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const title = req.body?.title || null;
    const description = req.body?.description || null;
    const type = req.body?.type;
    const published = req.body?.published !== undefined ? req.body.published === 'true' || req.body.published === true : undefined;
    const categoryIds = req.body?.categoryIds || null;
    const slug = req.body?.slug;
    const file = req.file;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Validate type field if provided
    if (type && !['portfolio', 'scratch'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "portfolio" or "scratch"' });
    }

    const updateFields: any = {
      title,
      description,
      type,
      published,
      updated_at: new Date()
    };

    if (slug !== undefined) {
      updateFields.slug = slug!;
    }

    if (file) {
      const username = req.user?.username!;
      const r2Result = await uploadToR2(file.buffer, file.originalname, username, 'artworks');
      updateFields.image_path = r2Result.url;
    }

    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    const updated = await db.update(artworks)
      .set(updateFields)
      .where(and(eq(artworks.id, parseInt(id)), eq(artworks.user_id, userId)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Artwork not found or unauthorized' });
    }

    const createdArtwork = updated[0];

    if (categoryIds !== null && categoryIds !== undefined) {
      await db.delete(artworkCategories)
        .where(eq(artworkCategories.artwork_id, parseInt(id)));

      const parsedIds = parseCategoryIds(categoryIds);
      if (parsedIds.length > 0) {
        const values = parsedIds.map((categoryId: number) => ({
          artwork_id: parseInt(id),
          category_id: categoryId
        }));
        await db.insert(artworkCategories).values(values);
      }
    }

    const artwork = createdArtwork;

    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found or unauthorized' });
    }

    const formattedArtwork = await getArtworkWithCategories(artwork.id);
    res.status(201).json(formattedArtwork);
  } catch (error) {
    console.error('Error updating artwork:', error);
    res.status(500).json({ error: 'Failed to update artwork' });
  }
});

// Delete Artwork
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await db.delete(artworks)
      .where(and(eq(artworks.id, parseInt(id)), eq(artworks.user_id, userId)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Artwork not found or unauthorized' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting artwork:', error);
    res.status(500).json({ error: 'Failed to delete artwork' });
  }
});

export default router;