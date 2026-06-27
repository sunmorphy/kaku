import { Router } from 'express';
import { query } from '../db/connection';
import { videoUpload } from '../middleware/upload';
import { uploadToR2 } from '../services/r2';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all animations (public, no auth required)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = req.query.search as string || '';
    const categoryIds = req.query.categoryIds as string || '';

    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Add search condition
    if (search.trim()) {
      whereConditions.push(`(LOWER(a.title) LIKE $${paramIndex} OR LOWER(a.description) LIKE $${paramIndex})`);
      queryParams.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    // Filter by published for public endpoint
    whereConditions.push(`a.published = true`);

    // Add category filter condition
    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          const categoryPlaceholders = categoryIdArray.map((_, i) => `$${paramIndex + i}`).join(', ');
          whereConditions.push(`EXISTS (
            SELECT 1 FROM animation_categories ac2 
            WHERE ac2.animation_id = a.id AND ac2.category_id IN (${categoryPlaceholders})
          )`);
          queryParams.push(...categoryIdArray);
          paramIndex += categoryIdArray.length;
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(DISTINCT a.id) as total
      FROM animations a
      LEFT JOIN animation_categories ac ON a.id = ac.animation_id
      LEFT JOIN categories c ON ac.category_id = c.id
      ${whereClause}
    `, queryParams);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const result = await query(`
      SELECT 
        a.id,
        a.batch_video_path,
        a.title,
        a.description,
        a.published,
        a.user_id,
        a.created_at,
        a.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'category', JSON_BUILD_OBJECT(
                'id', c.id,
                'name', c.name,
                'user_id', c.user_id,
                'created_at', c.created_at,
                'updated_at', c.updated_at
              )
            )
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) as animation_categories
      FROM animations a
      LEFT JOIN animation_categories ac ON a.id = ac.animation_id
      LEFT JOIN categories c ON ac.category_id = c.id
      ${whereClause}
      GROUP BY a.id
      ORDER BY a.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...queryParams, limit, offset]);

    res.status(200).json({
      data: result.rows,
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
    res.status(500).json({ error: 'Failed to fetch animations' });
  }
});

// Get animations by user ID (public, no auth required)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = req.query.search as string || '';
    const categoryIds = req.query.categoryIds as string || '';

    const offset = (page - 1) * limit;

    let whereConditions = ['a.user_id = $1'];
    let queryParams: any[] = [parseInt(userId)];
    let paramIndex = 2;

    // Add search condition
    if (search.trim()) {
      whereConditions.push(`(LOWER(a.title) LIKE $${paramIndex} OR LOWER(a.description) LIKE $${paramIndex})`);
      queryParams.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    // Filter by published for public endpoint
    whereConditions.push(`a.published = true`);

    // Add category filter condition
    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          const categoryPlaceholders = categoryIdArray.map((_, i) => `$${paramIndex + i}`).join(', ');
          whereConditions.push(`EXISTS (
            SELECT 1 FROM animation_categories ac2 
            WHERE ac2.animation_id = a.id AND ac2.category_id IN (${categoryPlaceholders})
          )`);
          queryParams.push(...categoryIdArray);
          paramIndex += categoryIdArray.length;
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(DISTINCT a.id) as total
      FROM animations a
      LEFT JOIN animation_categories ac ON a.id = ac.animation_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE ${whereClause}
    `, queryParams);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const result = await query(`
      SELECT 
        a.id,
        a.batch_video_path,
        a.title,
        a.description,
        a.published,
        a.user_id,
        a.created_at,
        a.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'category', JSON_BUILD_OBJECT(
                'id', c.id,
                'name', c.name,
                'user_id', c.user_id,
                'created_at', c.created_at,
                'updated_at', c.updated_at
              )
            )
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) as animation_categories
      FROM animations a
      LEFT JOIN animation_categories ac ON a.id = ac.animation_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE ${whereClause}
      GROUP BY a.id
      ORDER BY a.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...queryParams, limit, offset]);

    res.status(200).json({
      data: result.rows,
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
    res.status(500).json({ error: 'Failed to fetch user animations' });
  }
});

// Get current user's animations (requires authentication)
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = req.query.search as string || '';
    const categoryIds = req.query.categoryIds as string || '';

    const offset = (page - 1) * limit;

    let whereConditions = ['a.user_id = $1'];
    let queryParams: any[] = [userId];
    let paramIndex = 2;

    // Add search condition
    if (search.trim()) {
      whereConditions.push(`(LOWER(a.title) LIKE $${paramIndex} OR LOWER(a.description) LIKE $${paramIndex})`);
      queryParams.push(`%${search.toLowerCase()}%`);
      paramIndex++;
    }

    // Add category filter condition
    if (categoryIds.trim()) {
      try {
        const categoryIdArray = JSON.parse(categoryIds);
        if (Array.isArray(categoryIdArray) && categoryIdArray.length > 0) {
          const categoryPlaceholders = categoryIdArray.map((_, i) => `$${paramIndex + i}`).join(', ');
          whereConditions.push(`EXISTS (
            SELECT 1 FROM animation_categories ac2 
            WHERE ac2.animation_id = a.id AND ac2.category_id IN (${categoryPlaceholders})
          )`);
          queryParams.push(...categoryIdArray);
          paramIndex += categoryIdArray.length;
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(DISTINCT a.id) as total
      FROM animations a
      LEFT JOIN animation_categories ac ON a.id = ac.animation_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE ${whereClause}
    `, queryParams);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const result = await query(`
      SELECT 
        a.id,
        a.batch_video_path,
        a.title,
        a.description,
        a.published,
        a.user_id,
        a.created_at,
        a.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'category', JSON_BUILD_OBJECT(
                'id', c.id,
                'name', c.name,
                'user_id', c.user_id,
                'created_at', c.created_at,
                'updated_at', c.updated_at
              )
            )
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) as animation_categories
      FROM animations a
      LEFT JOIN animation_categories ac ON a.id = ac.animation_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE ${whereClause}
      GROUP BY a.id
      ORDER BY a.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...queryParams, limit, offset]);

    res.status(200).json({
      data: result.rows,
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
    res.status(500).json({ error: 'Failed to fetch animations' });
  }
});

// Get single animation (public, no auth required)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT 
        a.id,
        a.batch_video_path,
        a.title,
        a.description,
        a.published,
        a.user_id,
        a.created_at,
        a.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'category', JSON_BUILD_OBJECT(
                'id', c.id,
                'name', c.name,
                'user_id', c.user_id,
                'created_at', c.created_at,
                'updated_at', c.updated_at
              )
            )
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) as animation_categories
      FROM animations a
      LEFT JOIN animation_categories ac ON a.id = ac.animation_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE a.id = $1 AND a.published = true
      GROUP BY a.id
    `, [parseInt(id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Animation not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch animation' });
  }
});

// Create animation (requires authentication, video-only)
router.post('/', authenticateToken, videoUpload.array('videos', 10), async (req, res) => {
  try {
    const title = req.body?.title || null;
    const description = req.body?.description || null;
    const published = req.body?.published !== undefined ? req.body.published === 'true' || req.body.published === true : true;
    const categoryIds = req.body?.categoryIds || null;
    const files = req.files as Express.Multer.File[];
    const userId = req.user?.userId;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'At least one video file is required' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const username = req.user?.username!;
    const videoUrls = await Promise.all(
      files.map(async (file) => {
        const r2Result = await uploadToR2(file.buffer, file.originalname, username, 'animations');
        return r2Result.url;
      })
    );

    const animationResult = await query(`
      INSERT INTO animations (batch_video_path, title, description, published, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [videoUrls, title, description || null, published, userId]);

    const animation = animationResult.rows[0];

    if (categoryIds && categoryIds.trim() !== '') {
      try {
        const parsedCategoryIds = JSON.parse(categoryIds);
        if (Array.isArray(parsedCategoryIds) && parsedCategoryIds.length > 0) {
          const values = parsedCategoryIds.map((categoryId: number) => `(${animation.id}, ${categoryId})`).join(', ');
          await query(`
            INSERT INTO animation_categories (animation_id, category_id)
            VALUES ${values}
          `);
        }
      } catch (error) {
        // Ignore JSON parse errors - categories are optional
      }
    }

    const result = await query(`
      SELECT 
        a.id,
        a.batch_video_path,
        a.title,
        a.description,
        a.published,
        a.user_id,
        a.created_at,
        a.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'category', JSON_BUILD_OBJECT(
                'id', c.id,
                'name', c.name,
                'user_id', c.user_id,
                'created_at', c.created_at,
                'updated_at', c.updated_at
              )
            )
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) as animation_categories
      FROM animations a
      LEFT JOIN animation_categories ac ON a.id = ac.animation_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE a.id = $1
      GROUP BY a.id
    `, [animation.id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create animation' });
  }
});

// Update animation (requires authentication)
router.put('/:id', authenticateToken, videoUpload.fields([
  { name: 'modifiedVideos', maxCount: 10 },
  { name: 'addedVideos', maxCount: 10 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const title = req.body?.title || null;
    const description = req.body?.description || null;
    const published = req.body?.published !== undefined ? req.body.published === 'true' || req.body.published === true : undefined;
    const categoryIds = req.body?.categoryIds || null;
    const userId = req.user?.userId;

    // Get current animation to access existing videos
    const currentAnimation = await query(`
      SELECT batch_video_path FROM animations WHERE id = $1 AND user_id = $2
    `, [parseInt(id), userId]);

    if (currentAnimation.rows.length === 0) {
      return res.status(404).json({ error: 'Animation not found or unauthorized' });
    }

    let currentVideos = [...currentAnimation.rows[0].batch_video_path];
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

    // Handle modified videos BEFORE removing videos (to maintain original indices)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const modifiedVideos = files?.modifiedVideos || [];

    if (modifiedVideos.length > 0 && req.body.modifiedVideoIndices) {
      try {
        const modifiedIndices = req.body.modifiedVideoIndices;
        const indices = Array.isArray(modifiedIndices) ? modifiedIndices : [modifiedIndices];

        const username = req.user?.username!;

        for (let i = 0; i < modifiedVideos.length && i < indices.length; i++) {
          const file = modifiedVideos[i];
          const originalIndex = parseInt(indices[i]);

          // Only modify if the video is not being removed and index is valid
          if (!removedIndices.includes(originalIndex) &&
            originalIndex >= 0 && originalIndex < currentVideos.length) {
            // Upload new video
            const r2Result = await uploadToR2(file.buffer, file.originalname, username, 'animations');
            currentVideos[originalIndex] = r2Result.url;
          }
        }
      } catch (error) {
        console.error('Error processing modified videos:', error);
      }
    }

    // Handle removed videos AFTER modifications (remove in reverse order to maintain indexing)
    if (removedIndices.length > 0) {
      removedIndices.sort((a, b) => b - a).forEach(index => {
        if (index >= 0 && index < currentVideos.length) {
          currentVideos.splice(index, 1);
        }
      });
    }

    // Handle newly added videos (append to the end)
    const addedVideos = files?.addedVideos || [];
    if (addedVideos.length > 0) {
      const username = req.user?.username!;
      const addedVideoUrls = await Promise.all(
        addedVideos.map(async (file) => {
          const r2Result = await uploadToR2(file.buffer, file.originalname, username, 'animations');
          return r2Result.url;
        })
      );
      // Append new videos to the end of the current videos array
      currentVideos.push(...addedVideoUrls);
    }

    // Update animation with new video array
    const updateQuery = `
      UPDATE animations 
      SET title = $2, description = $3, published = $4, batch_video_path = $5, updated_at = NOW()
      WHERE id = $1 AND user_id = $6 RETURNING *
    `;
    const updateParams = [parseInt(id), title || null, description || null, published, currentVideos, userId];

    const updateResult = await query(updateQuery, updateParams);
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Animation not found or unauthorized' });
    }

    if (categoryIds !== undefined) {
      await query(`DELETE FROM animation_categories WHERE animation_id = $1`, [parseInt(id)]);

      if (categoryIds && categoryIds.trim() !== '') {
        try {
          const parsedCategoryIds = JSON.parse(categoryIds);
          if (Array.isArray(parsedCategoryIds) && parsedCategoryIds.length > 0) {
            const values = parsedCategoryIds.map((categoryId: number) => `(${parseInt(id)}, ${categoryId})`).join(', ');
            await query(`
              INSERT INTO animation_categories (animation_id, category_id)
              VALUES ${values}
            `);
          }
        } catch (error) {
          // Ignore JSON parse errors - categories are optional
        }
      }
    }

    const result = await query(`
      SELECT 
        a.id,
        a.batch_video_path,
        a.title,
        a.description,
        a.published,
        a.user_id,
        a.created_at,
        a.updated_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'category', JSON_BUILD_OBJECT(
                'id', c.id,
                'name', c.name,
                'user_id', c.user_id,
                'created_at', c.created_at,
                'updated_at', c.updated_at
              )
            )
          ) FILTER (WHERE c.id IS NOT NULL), 
          '[]'
        ) as animation_categories
      FROM animations a
      LEFT JOIN animation_categories ac ON a.id = ac.animation_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE a.id = $1
      GROUP BY a.id
    `, [parseInt(id)]);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update animation' });
  }
});

// Delete animation (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const result = await query(`DELETE FROM animations WHERE id = $1 AND user_id = $2`, [parseInt(id), userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Animation not found or unauthorized' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete animation' });
  }
});

export default router;
