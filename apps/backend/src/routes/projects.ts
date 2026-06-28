import { Router } from 'express';
import { db } from '../db/connection';
import { projects, projectCategories, categories } from '../db/schema';
import { eq, or, and, inArray, exists, desc, count, SQL, ilike } from 'drizzle-orm';
import { upload } from '../middleware/upload';
import { uploadToR2 } from '../services/r2';
import { authenticateToken } from '../middleware/auth';
import { parseCategoryIds } from '../utils/categories';

const router = Router();

async function getProjectWithCategories(projectIdOrSlug: number | string) {
  const isNumeric = typeof projectIdOrSlug === 'number' || /^\d+$/.test(projectIdOrSlug.toString());

  const result = await db.query.projects.findFirst({
    where: isNumeric
      ? eq(projects.id, typeof projectIdOrSlug === 'number' ? projectIdOrSlug : parseInt(projectIdOrSlug))
      : eq(projects.slug, projectIdOrSlug.toString()),
    with: {
      projectCategories: {
        with: {
          category: true
        }
      }
    }
  });

  if (!result) return null;

  return {
    ...result,
    project_categories: result.projectCategories.map(pc => ({
      category: pc.category
    }))
  };
}

// Get all projects
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
        ilike(projects.title, `%${search}%`),
        ilike(projects.description, `%${search}%`)
      ));
    }

    if (type.trim() && (type === 'portfolio' || type === 'scratch')) {
      conditions.push(eq(projects.type, type));
    }

    conditions.push(eq(projects.published, true));

    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          conditions.push(exists(
            db.select()
              .from(projectCategories)
              .where(and(
                eq(projectCategories.project_id, projects.id),
                inArray(projectCategories.category_id, categoryIdArray)
              ))
          ));
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const totalResult = await db.select({ value: count() }).from(projects)
      .where(whereClause);
    const total = totalResult[0].value;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const projectsList = await db.query.projects.findMany({
      where: whereClause,
      with: {
        projectCategories: {
          with: {
            category: true
          }
        }
      },
      limit,
      offset,
      orderBy: [desc(projects.created_at)]
    });

    const formattedData = projectsList.map(p => ({
      ...p,
      project_categories: p.projectCategories.map(pc => ({
        category: pc.category
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
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get projects by user ID
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
    conditions.push(eq(projects.user_id, parseInt(userId)));

    if (search.trim()) {
      conditions.push(or(
        ilike(projects.title, `%${search}%`),
        ilike(projects.description, `%${search}%`)
      ));
    }

    if (type.trim() && (type === 'portfolio' || type === 'scratch')) {
      conditions.push(eq(projects.type, type));
    }

    conditions.push(eq(projects.published, true));

    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          conditions.push(exists(
            db.select()
              .from(projectCategories)
              .where(and(
                eq(projectCategories.project_id, projects.id),
                inArray(projectCategories.category_id, categoryIdArray)
              ))
          ));
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const totalResult = await db.select({ value: count() }).from(projects)
      .where(whereClause);
    const total = totalResult[0].value;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const projectsList = await db.query.projects.findMany({
      where: whereClause,
      with: {
        projectCategories: {
          with: {
            category: true
          }
        }
      },
      limit,
      offset,
      orderBy: [desc(projects.created_at)]
    });

    const formattedData = projectsList.map(p => ({
      ...p,
      project_categories: p.projectCategories.map(pc => ({
        category: pc.category
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
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'Failed to fetch user projects' });
  }
});

// Get current user's projects
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
    conditions.push(eq(projects.user_id, userId));

    if (search.trim()) {
      conditions.push(or(
        ilike(projects.title, `%${search}%`),
        ilike(projects.description, `%${search}%`)
      ));
    }

    if (type.trim() && (type === 'portfolio' || type === 'scratch')) {
      conditions.push(eq(projects.type, type));
    }

    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          conditions.push(exists(
            db.select()
              .from(projectCategories)
              .where(and(
                eq(projectCategories.project_id, projects.id),
                inArray(projectCategories.category_id, categoryIdArray)
              ))
          ));
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count for pagination
    const totalResult = await db.select({ value: count() }).from(projects)
      .where(whereClause);
    const total = totalResult[0].value;
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const projectsList = await db.query.projects.findMany({
      where: whereClause,
      with: {
        projectCategories: {
          with: {
            category: true
          }
        }
      },
      limit,
      offset,
      orderBy: [desc(projects.created_at)]
    });

    const formattedData = projectsList.map(p => ({
      ...p,
      project_categories: p.projectCategories.map(pc => ({
        category: pc.category
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
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const project = await db.query.projects.findFirst({
      where: and(
        eq(projects.slug, slug),
        eq(projects.published, true)
      ),
      with: {
        projectCategories: {
          with: {
            category: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const formatted = {
      ...project,
      project_categories: project.projectCategories.map(pc => ({
        category: pc.category
      }))
    };

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create project
router.post('/', authenticateToken, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]), async (req, res) => {
  try {
    const title = req.body?.title || null;
    const description = req.body?.description || null;
    const type = req.body?.type || 'portfolio';
    const published = req.body?.published !== undefined ? req.body.published === 'true' || req.body.published === true : true;
    const categoryIds = req.body?.categoryIds || null;
    const slug = req.body?.slug || null;
    const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const images = filesMap?.images || [];
    const coverImage = filesMap?.coverImage?.[0] || null;
    const userId = req.user?.userId;

    if (images.length === 0) {
      return res.status(400).json({ error: 'At least one image file is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (type && !['portfolio', 'scratch'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "portfolio" or "scratch"' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const username = req.user?.username!;

    let coverImageUrl: string | null = null;
    if (coverImage) {
      const r2Result = await uploadToR2(coverImage.buffer, coverImage.originalname, username, 'projects');
      coverImageUrl = r2Result.url;
    }

    const imageUrls = await Promise.all(
      images.map(async (file) => {
        const r2Result = await uploadToR2(file.buffer, file.originalname, username, 'projects');
        return r2Result.url;
      })
    );

    let finalImageUrls = imageUrls;
    if (req.body.imageOrder) {
      try {
        const order = JSON.parse(req.body.imageOrder) as string[];
        if (Array.isArray(order) && order.length > 0) {
          finalImageUrls = order.map(item => {
            if (item.startsWith('new-')) {
              const index = parseInt(item.split('-')[1]);
              return imageUrls[index];
            }
            return item;
          }).filter(Boolean);
        }
      } catch (error) {
        console.error('Error parsing imageOrder in POST:', error);
      }
    }

    const inserted = await db.insert(projects)
      .values({
        batch_image_path: finalImageUrls,
        cover_image_path: coverImageUrl,
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

    const createdProject = inserted[0];

    const parsedIds = parseCategoryIds(categoryIds);
    if (parsedIds.length > 0) {
      const values = parsedIds.map((categoryId: number) => ({
        project_id: createdProject.id,
        category_id: categoryId
      }));
      await db.insert(projectCategories).values(values);
    }

    const project = createdProject;

    const formattedProject = await getProjectWithCategories(project.id);
    res.status(201).json(formattedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', authenticateToken, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'modifiedImages', maxCount: 10 },
  { name: 'addedImages', maxCount: 10 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const title = req.body?.title || null;
    const description = req.body?.description || null;
    const type = req.body?.type;
    const published = req.body?.published !== undefined ? req.body.published === 'true' || req.body.published === true : undefined;
    const categoryIds = req.body?.categoryIds || null;
    const slug = req.body?.slug;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (type && !['portfolio', 'scratch'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "portfolio" or "scratch"' });
    }

    const currentProjectResult = await db.select({ batch_image_path: projects.batch_image_path })
      .from(projects)
      .where(and(eq(projects.id, parseInt(id)), eq(projects.user_id, userId)));

    if (currentProjectResult.length === 0) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    let currentImages = [...currentProjectResult[0].batch_image_path];
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // Handle cover image
    const coverImage = files?.coverImage?.[0] || null;
    let coverImageUrl: string | undefined = undefined;
    if (coverImage) {
      const username = req.user?.username!;
      const r2Result = await uploadToR2(coverImage.buffer, coverImage.originalname, username, 'projects');
      coverImageUrl = r2Result.url;
    }

    // Check if new unified imageOrder format is used
    if (req.body.imageOrder) {
      try {
        const order = JSON.parse(req.body.imageOrder) as string[];
        if (Array.isArray(order)) {
          const newUploadedImages = files?.images || [];
          const username = req.user?.username!;
          const newUrls = await Promise.all(
            newUploadedImages.map(async (file) => {
              const r2Result = await uploadToR2(file.buffer, file.originalname, username, 'projects');
              return r2Result.url;
            })
          );

          currentImages = order.map(item => {
            if (item.startsWith('new-')) {
              const index = parseInt(item.split('-')[1]);
              return newUrls[index];
            }
            return item;
          }).filter(Boolean);
        }
      } catch (error) {
        console.error('Error parsing imageOrder in PUT:', error);
      }
    } else {
      // OLD LOGIC (Fallback)
      let removedIndices: number[] = [];

      // Parse removed image indices
      if (req.body.removedImageIndices) {
        try {
          removedIndices = JSON.parse(req.body.removedImageIndices);
          if (!Array.isArray(removedIndices)) {
            removedIndices = [];
          }
        } catch (error) {
          console.error('Error parsing removedImageIndices:', error);
          removedIndices = [];
        }
      }

      // Handle modified images BEFORE removing images
      const modifiedImages = files?.modifiedImages || [];
      if (modifiedImages.length > 0 && req.body.modifiedImageIndices) {
        try {
          const modifiedIndices = req.body.modifiedImageIndices;
          const indices = Array.isArray(modifiedIndices) ? modifiedIndices : [modifiedIndices];

          const username = req.user?.username!;

          for (let i = 0; i < modifiedImages.length && i < indices.length; i++) {
            const file = modifiedImages[i];
            const originalIndex = parseInt(indices[i]);

            if (!removedIndices.includes(originalIndex) &&
              originalIndex >= 0 && originalIndex < currentImages.length) {
              const r2Result = await uploadToR2(file.buffer, file.originalname, username, 'projects');
              currentImages[originalIndex] = r2Result.url;
            }
          }
        } catch (error) {
          console.error('Error processing modified images:', error);
        }
      }

      // Handle removed images AFTER modifications (reverse order)
      if (removedIndices.length > 0) {
        removedIndices.sort((a, b) => b - a).forEach(index => {
          if (index >= 0 && index < currentImages.length) {
            currentImages.splice(index, 1);
          }
        });
      }

      // Handle newly added images
      const addedImages = files?.addedImages || [];
      if (addedImages.length > 0) {
        const username = req.user?.username!;
        const addedImageUrls = await Promise.all(
          addedImages.map(async (file) => {
            const r2Result = await uploadToR2(file.buffer, file.originalname, username, 'projects');
            return r2Result.url;
          })
        );
        currentImages.push(...addedImageUrls);
      }
    }

    const updateFields: any = {
      title,
      description,
      type,
      published,
      batch_image_path: currentImages,
      updated_at: new Date()
    };

    if (coverImageUrl !== undefined) {
      updateFields.cover_image_path = coverImageUrl;
    }

    if (slug !== undefined) {
      updateFields.slug = slug!;
    }

    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    const updated = await db.update(projects)
      .set(updateFields)
      .where(and(eq(projects.id, parseInt(id)), eq(projects.user_id, userId)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    const createdProject = updated[0];

    if (categoryIds !== null && categoryIds !== undefined) {
      await db.delete(projectCategories)
        .where(eq(projectCategories.project_id, parseInt(id)));

      const parsedIds = parseCategoryIds(categoryIds);
      if (parsedIds.length > 0) {
        const values = parsedIds.map((categoryId: number) => ({
          project_id: parseInt(id),
          category_id: categoryId
        }));
        await db.insert(projectCategories).values(values);
      }
    }

    const project = createdProject;

    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    const formattedProject = await getProjectWithCategories(project.id);
    res.status(201).json(formattedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await db.delete(projects)
      .where(and(eq(projects.id, parseInt(id)), eq(projects.user_id, userId)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;