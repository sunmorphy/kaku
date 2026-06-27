import { Router } from 'express';
import { db } from '../db/connection';
import { categories } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const result = await db.select().from(categories).orderBy(desc(categories.created_at));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get categories by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.select().from(categories)
      .where(eq(categories.user_id, parseInt(userId)))
      .orderBy(desc(categories.created_at));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user categories' });
  }
});

// Get current user's categories
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await db.select().from(categories)
      .where(eq(categories.user_id, userId))
      .orderBy(desc(categories.created_at));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await db.insert(categories)
      .values({ name, user_id: userId })
      .returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await db.update(categories)
      .set({ name, updated_at: new Date() })
      .where(and(eq(categories.id, parseInt(id)), eq(categories.user_id, userId)))
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: 'Category not found or unauthorized' });
    }
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await db.delete(categories)
      .where(and(eq(categories.id, parseInt(id)), eq(categories.user_id, userId)))
      .returning();
    if (result.length === 0) {
      return res.status(404).json({ error: 'Category not found or unauthorized' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;