import { Router } from 'express';
import { db } from '../db/connection';
import { animations, animationCategories, categories } from '../db/schema';
import { eq, or, and, inArray, exists, desc, count, SQL, ilike } from 'drizzle-orm';
import { animationUpload } from '../middleware/upload';
import { uploadToR2 } from '../services/r2';
import { authenticateToken } from '../middleware/auth';
import { parseCategoryIds } from '../utils/categories';

const router = Router();

async function getAnimationWithCategories(animationIdOrSlug: number | string) {
  const isNumeric = typeof animationIdOrSlug === 'number' || /^\d+$/.test(animationIdOrSlug.toString());

  const result = await db.query.animations.findFirst({
    where: isNumeric
      ? eq(animations.id, typeof animationIdOrSlug === 'number' ? animationIdOrSlug : parseInt(animationIdOrSlug))
      : eq(animations.slug, animationIdOrSlug.toString()),
    with: {
      animationCategories: {
        with: {
          category: true
        }
      }
    }
  });

  if (!result) return null;

  return {
    ...result,
    animation_categories: result.animationCategories.map(ac => ({
      category: ac.category
    }))
  };
}

// Get all animations
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = req.query.search as string || '';
    const categoryIds = req.query.categoryIds as string || '';

    const offset = (page - 1) * limit;

    const conditions: (SQL | undefined)[] = [];

    if (search.trim()) {
      conditions.push(or(
        ilike(animations.title, `%${search}%`),
        ilike(animations.description, `%${search}%`)
      ));
    }

    conditions.push(eq(animations.published, true));

    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          conditions.push(exists(
            db.select()
              .from(animationCategories)
              .where(and(
                eq(animationCategories.animation_id, animations.id),
                inArray(animationCategories.category_id, categoryIdArray)
              ))
          ));
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const totalResult = await db.select({ value: count() }).from(animations)
      .where(whereClause);
    const total = totalResult[0].value;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const animationsList = await db.query.animations.findMany({
      where: whereClause,
      with: {
        animationCategories: {
          with: {
            category: true
          }
        }
      },
      limit,
      offset,
      orderBy: [desc(animations.created_at)]
    });

    const formattedData = animationsList.map(a => ({
      ...a,
      animation_categories: a.animationCategories.map(ac => ({
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
    console.error('Error fetching animations:', error);
    res.status(500).json({ error: 'Failed to fetch animations' });
  }
});

// Get animations by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = req.query.search as string || '';
    const categoryIds = req.query.categoryIds as string || '';

    const offset = (page - 1) * limit;

    const conditions: (SQL | undefined)[] = [];
    conditions.push(eq(animations.user_id, parseInt(userId)));

    if (search.trim()) {
      conditions.push(or(
        ilike(animations.title, `%${search}%`),
        ilike(animations.description, `%${search}%`)
      ));
    }

    conditions.push(eq(animations.published, true));

    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          conditions.push(exists(
            db.select()
              .from(animationCategories)
              .where(and(
                eq(animationCategories.animation_id, animations.id),
                inArray(animationCategories.category_id, categoryIdArray)
              ))
          ));
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const totalResult = await db.select({ value: count() }).from(animations)
      .where(whereClause);
    const total = totalResult[0].value;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const animationsList = await db.query.animations.findMany({
      where: whereClause,
      with: {
        animationCategories: {
          with: {
            category: true
          }
        }
      },
      limit,
      offset,
      orderBy: [desc(animations.created_at)]
    });

    const formattedData = animationsList.map(a => ({
      ...a,
      animation_categories: a.animationCategories.map(ac => ({
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
    console.error('Error fetching user animations:', error);
    res.status(500).json({ error: 'Failed to fetch user animations' });
  }
});

// Get current user's animations
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

    const offset = (page - 1) * limit;

    const conditions: (SQL | undefined)[] = [];
    conditions.push(eq(animations.user_id, userId));

    if (search.trim()) {
      conditions.push(or(
        ilike(animations.title, `%${search}%`),
        ilike(animations.description, `%${search}%`)
      ));
    }

    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          conditions.push(exists(
            db.select()
              .from(animationCategories)
              .where(and(
                eq(animationCategories.animation_id, animations.id),
                inArray(animationCategories.category_id, categoryIdArray)
              ))
          ));
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const totalResult = await db.select({ value: count() }).from(animations)
      .where(whereClause);
    const total = totalResult[0].value;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const animationsList = await db.query.animations.findMany({
      where: whereClause,
      with: {
        animationCategories: {
          with: {
            category: true
          }
        }
      },
      limit,
      offset,
      orderBy: [desc(animations.created_at)]
    });

    const formattedData = animationsList.map(a => ({
      ...a,
      animation_categories: a.animationCategories.map(ac => ({
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
    console.error('Error fetching animations:', error);
    res.status(500).json({ error: 'Failed to fetch animations' });
  }
});

// Get animation by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const animation = await db.query.animations.findFirst({
      where: and(
        eq(animations.slug, slug),
        eq(animations.published, true)
      ),
      with: {
        animationCategories: {
          with: {
            category: true
          }
        }
      }
    });

    if (!animation) {
      return res.status(404).json({ error: 'Animation not found' });
    }

    const formatted = {
      ...animation,
      animation_categories: animation.animationCategories.map(ac => ({
        category: ac.category
      }))
    };

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching animation:', error);
    res.status(500).json({ error: 'Failed to fetch animation' });
  }
});

// Create animation
router.post('/', authenticateToken, animationUpload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'videos', maxCount: 10 }
]), async (req, res) => {
  try {
    const title = req.body?.title || null;
    const description = req.body?.description || null;
    const published = req.body?.published !== undefined ? req.body.published === 'true' || req.body.published === true : true;
    const categoryIds = req.body?.categoryIds || null;
    const slug = req.body?.slug || null;
    const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const videos = filesMap?.videos || [];
    const coverImage = filesMap?.coverImage?.[0] || null;
    const userId = req.user?.userId;

    if (videos.length === 0) {
      return res.status(400).json({ error: 'At least one video file is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const username = req.user?.username!;

    let coverImageUrl: string | null = null;
    if (coverImage) {
      const r2Result = await uploadToR2(coverImage.buffer, coverImage.originalname, username, 'animations');
      coverImageUrl = r2Result.url;
    }

    const videoUrls = await Promise.all(
      videos.map(async (file) => {
        const r2Result = await uploadToR2(file.buffer, file.originalname, username, 'animations');
        return r2Result.url;
      })
    );

    let finalVideoUrls = videoUrls;
    if (req.body.videoOrder) {
      try {
        const order = JSON.parse(req.body.videoOrder) as string[];
        if (Array.isArray(order) && order.length > 0) {
          finalVideoUrls = order.map(item => {
            if (item.startsWith('new-')) {
              const index = parseInt(item.split('-')[1]);
              return videoUrls[index];
            }
            return item;
          }).filter(Boolean);
        }
      } catch (error) {
        console.error('Error parsing videoOrder in POST:', error);
      }
    }

    const inserted = await db.insert(animations)
      .values({
        batch_video_path: finalVideoUrls,
        cover_image_path: coverImageUrl,
        title,
        description,
        published,
        user_id: userId,
        slug: slug!,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();

    const createdAnimation = inserted[0];

    const parsedIds = parseCategoryIds(categoryIds);
    if (parsedIds.length > 0) {
      const values = parsedIds.map((categoryId: number) => ({
        animation_id: createdAnimation.id,
        category_id: categoryId
      }));
      await db.insert(animationCategories).values(values);
    }

    const animation = createdAnimation;

    const formattedAnimation = await getAnimationWithCategories(animation.id);
    res.status(201).json(formattedAnimation);
  } catch (error) {
    console.error('Error creating animation:', error);
    res.status(500).json({ error: 'Failed to create animation' });
  }
});

// Update animation
router.put('/:id', authenticateToken, animationUpload.fields([
  { name: 'videos', maxCount: 10 },
  { name: 'modifiedVideos', maxCount: 10 },
  { name: 'addedVideos', maxCount: 10 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const title = req.body?.title || null;
    const description = req.body?.description || null;
    const published = req.body?.published !== undefined ? req.body.published === 'true' || req.body.published === true : undefined;
    const categoryIds = req.body?.categoryIds || null;
    const slug = req.body?.slug;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const currentAnimationResult = await db.select({ batch_video_path: animations.batch_video_path })
      .from(animations)
      .where(and(eq(animations.id, parseInt(id)), eq(animations.user_id, userId)));

    if (currentAnimationResult.length === 0) {
      return res.status(404).json({ error: 'Animation not found or unauthorized' });
    }

    let currentVideos = [...currentAnimationResult[0].batch_video_path];
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    const coverImage = files?.coverImage?.[0] || null;
    let coverImageUrl: string | undefined = undefined;
    if (coverImage) {
      const username = req.user?.username!;
      const r2Result = await uploadToR2(coverImage.buffer, coverImage.originalname, username, 'animations');
      coverImageUrl = r2Result.url;
    }

    // Check if new unified videoOrder format is used
    if (req.body.videoOrder) {
      try {
        const order = JSON.parse(req.body.videoOrder) as string[];
        if (Array.isArray(order)) {
          const newUploadedVideos = files?.videos || [];
          const username = req.user?.username!;
          const newUrls = await Promise.all(
            newUploadedVideos.map(async (file) => {
              const r2Result = await uploadToR2(file.buffer, file.originalname, username, 'animations');
              return r2Result.url;
            })
          );

          currentVideos = order.map(item => {
            if (item.startsWith('new-')) {
              const index = parseInt(item.split('-')[1]);
              return newUrls[index];
            }
            return item;
          }).filter(Boolean);
        }
      } catch (error) {
        console.error('Error parsing videoOrder in PUT:', error);
      }
    } else {
      // OLD LOGIC (Fallback)
      let removedIndices: number[] = [];

      // Parse removed video indices
      if (req.body.removedVideoIndices) {
        try {
          removedIndices = JSON.parse(req.body.removedVideoIndices);
          if (!Array.isArray(removedIndices)) {
            removedIndices = [];
          }
        } catch (error) {
          console.error('Error parsing removedVideoIndices:', error);
          removedIndices = [];
        }
      }

      // Handle modified videos BEFORE removing videos
      const modifiedVideos = files?.modifiedVideos || [];
      if (modifiedVideos.length > 0 && req.body.modifiedVideoIndices) {
        try {
          const modifiedIndices = req.body.modifiedVideoIndices;
          const indices = Array.isArray(modifiedIndices) ? modifiedIndices : [modifiedIndices];

          const username = req.user?.username!;

          for (let i = 0; i < modifiedVideos.length && i < indices.length; i++) {
            const file = modifiedVideos[i];
            const originalIndex = parseInt(indices[i]);

            if (!removedIndices.includes(originalIndex) &&
              originalIndex >= 0 && originalIndex < currentVideos.length) {
              const r2Result = await uploadToR2(file.buffer, file.originalname, username, 'animations');
              currentVideos[originalIndex] = r2Result.url;
            }
          }
        } catch (error) {
          console.error('Error processing modified videos:', error);
        }
      }

      // Handle removed videos AFTER modifications (reverse order)
      if (removedIndices.length > 0) {
        removedIndices.sort((a, b) => b - a).forEach(index => {
          if (index >= 0 && index < currentVideos.length) {
            currentVideos.splice(index, 1);
          }
        });
      }

      // Handle newly added videos
      const addedVideos = files?.addedVideos || [];
      if (addedVideos.length > 0) {
        const username = req.user?.username!;
        const addedVideoUrls = await Promise.all(
          addedVideos.map(async (file) => {
            const r2Result = await uploadToR2(file.buffer, file.originalname, username, 'animations');
            return r2Result.url;
          })
        );
        currentVideos.push(...addedVideoUrls);
      }
    }

    const updateFields: any = {
      title,
      description,
      published,
      batch_video_path: currentVideos,
      updated_at: new Date()
    };

    if (coverImageUrl !== undefined) {
      updateFields.cover_image_path = coverImageUrl;
    }

    if (slug !== undefined) {
      updateFields.slug = slug!
    }

    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    const updated = await db.update(animations)
      .set(updateFields)
      .where(and(eq(animations.id, parseInt(id)), eq(animations.user_id, userId)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Animation not found or unauthorized' });
    }

    const createdAnimation = updated[0];

    if (categoryIds !== null && categoryIds !== undefined) {
      await db.delete(animationCategories)
        .where(eq(animationCategories.animation_id, parseInt(id)));

      const parsedIds = parseCategoryIds(categoryIds);
      if (parsedIds.length > 0) {
        const values = parsedIds.map((categoryId: number) => ({
          animation_id: parseInt(id),
          category_id: categoryId
        }));
        await db.insert(animationCategories).values(values);
      }
    }

    const animation = createdAnimation;

    if (!animation) {
      return res.status(404).json({ error: 'Animation not found or unauthorized' });
    }

    const formattedAnimation = await getAnimationWithCategories(animation.id);
    res.status(200).json(formattedAnimation);
  } catch (error) {
    console.error('Error updating animation:', error);
    res.status(500).json({ error: 'Failed to update animation' });
  }
});

// Delete animation
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await db.delete(animations)
      .where(and(eq(animations.id, parseInt(id)), eq(animations.user_id, userId)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Animation not found or unauthorized' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting animation:', error);
    res.status(500).json({ error: 'Failed to delete animation' });
  }
});

export default router;
