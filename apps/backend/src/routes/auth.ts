import { Router } from 'express';
import { db } from '../db/connection';
import { users, contactMessages } from '../db/schema';
import { UserProfile } from '@kaku/types';
import { eq, or, and, ne, gt, count } from 'drizzle-orm';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { authenticateToken } from '../middleware/auth';
import { uploadProfileImageToR2 } from '../services/r2';
import { sendContactEmail } from '../utils/email';
import validator from 'validator';
import { upload } from '../middleware/upload';

const router = Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await db.select().from(users)
      .where(or(eq(users.username, username), eq(users.email, username)));

    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result[0];

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userProfile: UserProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name || '',
      pseudonym: user.pseudonym || '',
      role: user.role || 'Artist',
      summary: user.summary || '',
      short_summary: user.short_summary || '',
      socials: user.socials || [],
      profile_image_path: user.profile_image_path || '',
      banner_image_path: user.banner_image_path || '',
      created_at: user.created_at ? user.created_at.toISOString() : new Date().toISOString(),
      updated_at: user.updated_at ? user.updated_at.toISOString() : new Date().toISOString()
    };

    const token = generateToken(userProfile);

    res.status(200).json({
      message: 'Login successful',
      user: userProfile,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await db.select().from(users)
      .where(eq(users.id, req.user!.userId));

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result[0];
    const { password_hash, ...profileWithoutPassword } = user;
    res.json(profileWithoutPassword);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get user profile by ID
router.get('/profile/:userId', async (req, res) => {
  try {
    const result = await db.select().from(users)
      .where(eq(users.id, parseInt(req.params.userId)));

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result[0];
    const { password_hash, ...profileWithoutPassword } = user;
    res.status(200).json(profileWithoutPassword);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { email, name, pseudonym, role, summary, short_summary, socials } = req.body;
    const userId = req.user!.userId;

    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (socials && !Array.isArray(socials)) {
      return res.status(400).json({ error: 'Socials must be an array of strings' });
    }

    if (email) {
      const existingUser = await db.select().from(users)
        .where(and(eq(users.email, email), ne(users.id, userId)));

      if (existingUser.length > 0) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    const updateFields: any = {
      name: name !== undefined ? name : undefined,
      pseudonym: pseudonym !== undefined ? pseudonym : undefined,
      role: role !== undefined ? role : undefined,
      summary: summary !== undefined ? summary : undefined,
      short_summary: short_summary !== undefined ? short_summary : undefined,
      socials: socials !== undefined ? socials : undefined,
      updated_at: new Date()
    };

    if (email) {
      updateFields.email = email;
    }

    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    const result = await db.update(users)
      .set(updateFields)
      .where(eq(users.id, userId))
      .returning();

    const updatedUser = result[0];
    const { password_hash, ...profileWithoutPassword } = updatedUser;

    res.status(201).json({
      message: 'Profile updated successfully',
      user: profileWithoutPassword
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const userResult = await db.select({ password_hash: users.password_hash }).from(users)
      .where(eq(users.id, userId));

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValidPassword = await comparePassword(currentPassword, userResult[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db.update(users)
      .set({ password_hash: newPasswordHash, updated_at: new Date() })
      .where(eq(users.id, userId));

    res.status(201).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Upload profile image
router.post('/profile/image', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const userId = req.user!.userId;

    const userResult = await db.select({ username: users.username }).from(users)
      .where(eq(users.id, userId));
    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const username = userResult[0].username;
    const fileName = `profile_${Date.now()}_${req.file.originalname}`;

    const uploadResult = await uploadProfileImageToR2(req.file.buffer, fileName, username);

    const result = await db.update(users)
      .set({ profile_image_path: uploadResult.url, updated_at: new Date() })
      .where(eq(users.id, userId))
      .returning();

    const updatedUser = result[0];
    const { password_hash, ...profileWithoutPassword } = updatedUser;

    res.status(201).json({
      message: 'Profile image uploaded successfully',
      user: profileWithoutPassword,
      imageUrl: uploadResult.url
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile image' });
  }
});

// Upload banner image
router.post('/profile/banner', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const userId = req.user!.userId;

    const userResult = await db.select({ username: users.username }).from(users)
      .where(eq(users.id, userId));
    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const username = userResult[0].username;
    const fileName = `banner_${Date.now()}_${req.file.originalname}`;

    const uploadResult = await uploadProfileImageToR2(req.file.buffer, fileName, username);

    const result = await db.update(users)
      .set({ banner_image_path: uploadResult.url, updated_at: new Date() })
      .where(eq(users.id, userId))
      .returning();

    const updatedUser = result[0];
    const { password_hash, ...profileWithoutPassword } = updatedUser;

    res.status(201).json({
      message: 'Banner image uploaded successfully',
      user: profileWithoutPassword,
      imageUrl: uploadResult.url
    });
  } catch (error) {
    console.error('Banner image upload error:', error);
    res.status(500).json({ error: 'Failed to upload banner image' });
  }
});

// Contact form endpoint
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message, honeypot } = req.body;

    // Honeypot spam protection - if honeypot field is filled, it's likely spam
    if (honeypot && honeypot.trim() !== '') {
      return res.status(400).json({ error: 'Spam detected' });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (message.length < 10) {
      return res.status(400).json({ error: 'Message must be at least 10 characters long' });
    }

    // Rate limit
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSubmissions = await db.select({ value: count() }).from(contactMessages)
      .where(gt(contactMessages.created_at, oneHourAgo));

    if (recentSubmissions[0].value >= 5) {
      return res.status(429).json({ error: 'Too many submissions. Please try again later.' });
    }

    // Simple spam detection with check for suspicious patterns
    const suspiciousPatterns = [
      /https?:\/\//gi, // URLs in message
      /\b(viagra|casino|lottery|winner|prize|click here|free money)\b/gi, // Common spam words
      /(.)\1{10,}/gi // Repeated characters (10+ times)
    ];

    const messageContent = `${name} ${email} ${subject || ''} ${message}`.toLowerCase();
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(messageContent)) {
        return res.status(400).json({ error: 'Message contains suspicious content' });
      }
    }

    const result = await db.insert(contactMessages)
      .values({
        name,
        email,
        subject: subject || null,
        message,
        created_at: new Date()
      })
      .returning();

    // Send email notification
    try {
      await sendContactEmail({
        name,
        email,
        subject: subject || undefined,
        message
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      message: 'Contact message sent successfully',
      contact: result[0]
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send contact message' });
  }
});

export default router;