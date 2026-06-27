import { Router } from 'express';
import { query } from '../db/connection';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { authenticateToken } from '../middleware/auth';
import { User, UserProfile } from '../db/schema';
import { uploadProfileImageToR2 } from '../services/r2';
import { sendContactEmail } from '../utils/email';
import validator from 'validator';
import multer from 'multer';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username or email
    const result = await query(`
      SELECT id, username, email, password_hash, name, pseudonym, role, summary, short_summary, socials, profile_image_path, banner_image_path, created_at, updated_at
      FROM users 
      WHERE username = $1 OR email = $1
    `, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0] as User;

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const userProfile: UserProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      pseudonym: user.pseudonym,
      role: user.role,
      summary: user.summary,
      short_summary: user.short_summary,
      socials: user.socials,
      profile_image_path: user.profile_image_path,
      banner_image_path: user.banner_image_path,
      created_at: user.created_at,
      updated_at: user.updated_at
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
    const result = await query(`
      SELECT id, username, email, name, pseudonym, role, summary, short_summary, socials, profile_image_path, banner_image_path, created_at, updated_at
      FROM users 
      WHERE id = $1
    `, [req.user!.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get user profile by id
router.get('/profile/:userId', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, username, email, name, pseudonym, role, summary, short_summary, socials, profile_image_path, banner_image_path, created_at, updated_at
      FROM users 
      WHERE id = $1
    `, [req.params.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(result.rows[0]);
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

    // Validate email if provided
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate socials array
    if (socials && !Array.isArray(socials)) {
      return res.status(400).json({ error: 'Socials must be an array of strings' });
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await query(
        `SELECT id FROM users WHERE email = $1 AND id != $2`,
        [email, userId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    const result = await query(`
      UPDATE users 
      SET email = COALESCE($2, email),
          name = $3,
          pseudonym = $4,
          role = $5,
          summary = $6,
          short_summary = $7,
          socials = $8,
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, email, name, pseudonym, role, summary, short_summary, socials, profile_image_path, banner_image_path, created_at, updated_at
    `, [userId, email, name, pseudonym, role, summary, short_summary, socials]);

    res.status(201).json({
      message: 'Profile updated successfully',
      user: result.rows[0]
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

    // Get current password hash
    const userResult = await query(`SELECT password_hash FROM users WHERE id = $1`, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, userResult.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await query(`
      UPDATE users 
      SET password_hash = $2, updated_at = NOW()
      WHERE id = $1
    `, [userId, newPasswordHash]);

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

    // Get user to determine username for folder structure
    const userResult = await query(`SELECT username FROM users WHERE id = $1`, [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const username = userResult.rows[0].username;
    const fileName = `profile_${Date.now()}_${req.file.originalname}`;

    // Upload to R2
    const uploadResult = await uploadProfileImageToR2(req.file.buffer, fileName, username);

    // Update user profile with new image path
    const result = await query(`
      UPDATE users 
      SET profile_image_path = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, email, name, pseudonym, role, summary, short_summary, socials, profile_image_path, banner_image_path, created_at, updated_at
    `, [userId, uploadResult.url]);

    res.status(201).json({
      message: 'Profile image uploaded successfully',
      user: result.rows[0],
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

    // Get user to determine username for folder structure
    const userResult = await query(`SELECT username FROM users WHERE id = $1`, [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const username = userResult.rows[0].username;
    const fileName = `banner_${Date.now()}_${req.file.originalname}`;

    // Upload to R2
    const uploadResult = await uploadProfileImageToR2(req.file.buffer, fileName, username);

    // Update user profile with new banner image path
    const result = await query(`
      UPDATE users 
      SET banner_image_path = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, email, name, pseudonym, role, summary, short_summary, socials, profile_image_path, banner_image_path, created_at, updated_at
    `, [userId, uploadResult.url]);

    res.status(201).json({
      message: 'Banner image uploaded successfully',
      user: result.rows[0],
      imageUrl: uploadResult.url
    });
  } catch (error) {
    console.error('Banner image upload error:', error);
    res.status(500).json({ error: 'Failed to upload banner image' });
  }
});

// Contact form endpoint with spam prevention
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

    // Rate limiting check - prevent too many submissions globally
    const recentSubmissions = await query(`
      SELECT COUNT(*) as count 
      FROM contact_messages 
      WHERE created_at > NOW() - INTERVAL '1 hour'
    `);

    if (recentSubmissions.rows[0].count >= 5) {
      return res.status(429).json({ error: 'Too many submissions. Please try again later.' });
    }

    // Simple spam detection - check for suspicious patterns
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

    // Store contact message in database
    const result = await query(`
      INSERT INTO contact_messages (name, email, subject, message, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, name, email, subject, message, created_at
    `, [name, email, subject || null, message]);

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
      // Don't fail the request if email fails, just log it
    }

    res.status(201).json({
      message: 'Contact message sent successfully',
      contact: result.rows[0]
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send contact message' });
  }
});

export default router;