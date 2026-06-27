# Portfolio Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

**Note:** Read operations (GET requests) for artworks, categories, and projects do NOT require authentication.

---

## Authentication Endpoints (`/auth`)

### Login
#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "string", // username or email
  "password": "string"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "name": "string",
    "pseudonym": "string",
    "role": "string",
    "summary": "string",
    "short_summary": "string",
    "socials": ["string"],
    "profile_image_path": "string",
    "banner_image_path": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "token": "jwt_token_string"
}
```

### Get User Profile by ID (NO AUTH REQUIRED)
#### GET /auth/profile/:userId
Get public profile information for a specific user.

**Response (200):**
```json
{
  "id": 1,
  "username": "string",
  "name": "string",        // Note: email is excluded for privacy
  "pseudonym": "string",
  "role": "string",
  "summary": "string",
  "short_summary": "string",
  "socials": ["string"],
  "profile_image_path": "string",
  "banner_image_path": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Get Current User Profile (NO AUTH REQUIRED)
#### GET /auth/profile
Get current authenticated user's profile.

**Response (200):**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",       // Email included for own profile
  "name": "string",
  "summary": "string",
  "socials": ["string"],
  "profile_image_path": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Update User Profile
#### PUT /auth/profile
**Requires Authentication**

**Request Body:**
```json
{
  "email": "string",       // Optional
  "name": "string",        // Optional full/real name
  "pseudonym": "string",   // Optional artist/display name
  "role": "string",        // Optional (e.g., "Artist", "Designer", "Photographer")
  "summary": "string",     // Optional longer description/bio
  "short_summary": "string", // Optional brief one-liner
  "socials": ["string"]    // Optional array
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "name": "string",
    "pseudonym": "string",
    "role": "string",
    "summary": "string",
    "short_summary": "string",
    "socials": ["string"],
    "profile_image_path": "string",
    "banner_image_path": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### Change Password
#### PUT /auth/password
**Requires Authentication**

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"  // Minimum 6 characters
}
```

**Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

### Upload Profile Image
#### POST /auth/profile/image
**Requires Authentication**
Content-Type: multipart/form-data

**Form Data:**
- `image`: file (Image file, max 5MB)

**Response (200):**
```json
{
  "message": "Profile image uploaded successfully",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "name": "string",
    "pseudonym": "string",
    "role": "string",
    "summary": "string",
    "short_summary": "string",
    "socials": ["string"],
    "profile_image_path": "string",
    "banner_image_path": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "imageUrl": "string"
}
```

### Upload Banner Image
#### POST /auth/profile/banner
**Requires Authentication**
Content-Type: multipart/form-data

**Form Data:**
- `image`: file (Image file, max 5MB)

**Response (201):**
```json
{
  "message": "Banner image uploaded successfully",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "name": "string",
    "pseudonym": "string",
    "role": "string",
    "summary": "string",
    "short_summary": "string",
    "socials": ["string"],
    "profile_image_path": "string",
    "banner_image_path": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  "imageUrl": "string"
}
```

### Send Contact Message (NO AUTH REQUIRED)
#### POST /auth/contact
Send a contact message from website visitors.

**Request Body:**
```json
{
  "name": "string",         // Required
  "email": "string",        // Required, must be valid email
  "subject": "string",      // Optional
  "message": "string",      // Required, minimum 10 characters
  "honeypot": "string"      // Optional, leave empty (spam trap)
}
```

**Response (201):**
```json
{
  "message": "Contact message sent successfully",
  "contact": {
    "id": 1,
    "name": "string",
    "email": "string",
    "subject": "string",
    "message": "string",
    "created_at": "timestamp"
  }
}
```

**Error Responses:**
```json
// Spam detected via honeypot
{
  "error": "Spam detected"
}

// Rate limiting exceeded
{
  "error": "Too many submissions. Please try again later."
}

// Suspicious content detected
{
  "error": "Message contains suspicious content"
}

// Missing required fields
{
  "error": "Name, email, and message are required"
}
```

**Features:**
- **Email Notification**: Automatically sends formatted email to configured recipient
- **Database Storage**: All messages are stored for record keeping
- **Spam Prevention**: Multiple layers of protection (see below)
- **Graceful Degradation**: Form works even if email fails

**Spam Prevention Features:**
- **Honeypot Field**: Include a hidden `honeypot` field in your form. Bots will fill it, humans won't.
- **Rate Limiting**: Max 5 submissions per hour globally
- **Content Filtering**: Blocks URLs, spam keywords, and suspicious patterns
- **Input Validation**: Email format and minimum message length requirements

**SMTP Configuration (Environment Variables):**
```env
SMTP_HOST=smtp.gmail.com              # SMTP server host
SMTP_PORT=587                         # SMTP port (587 for TLS, 465 for SSL)
SMTP_SECURE=false                     # true for SSL (port 465), false for TLS (port 587)
SMTP_USER=your-email@gmail.com        # SMTP username
SMTP_PASSWORD=your-app-password       # SMTP password or app password
CONTACT_RECIPIENT_EMAIL=admin@yoursite.com  # Where to send contact emails (optional, defaults to SMTP_USER)
```

**Popular SMTP Providers:**
- **Gmail**: `smtp.gmail.com:587` (requires app password)
- **Outlook**: `smtp-mail.outlook.com:587`
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`

---

## Artwork Endpoints (`/artworks`)

### Get All Artworks (NO AUTH REQUIRED)
#### GET /artworks
Get paginated list of all artworks.

**Query Parameters:**
- `page`: number (optional, default: 1)
- `limit`: number (optional, default: 25)
- `search`: string (optional, searches title and description)
- `categoryIds`: JSON array string (optional, filters by category IDs)
- `type`: string (optional, filters by type: "portfolio" or "scratch")

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "image_path": "string",
      "title": "string",
      "description": "string",
      "type": "portfolio",
      "published": true,
      "user_id": 1,
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "artwork_categories": [
        {
          "category": {
            "id": 1,
            "name": "string",
            "user_id": 1,
            "created_at": "timestamp",
            "updated_at": "timestamp"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 100,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Artworks by User ID (NO AUTH REQUIRED)
#### GET /artworks/user/:userId
Get paginated list of artworks for a specific user.

**Query Parameters:** Same as Get All Artworks

**Response (200):** Same format as Get All Artworks

### Get Single Artwork (NO AUTH REQUIRED)
#### GET /artworks/:id

**Response (200):**
```json
{
  "id": 1,
  "image_path": "string",
  "title": "string",
  "description": "string",
  "type": "portfolio",
  "published": true,
  "user_id": 1,
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "artwork_categories": [
    {
      "category": {
        "id": 1,
        "name": "string",
        "user_id": 1,
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    }
  ]
}
```

### Create Artwork
#### POST /artworks
**Requires Authentication**
Content-Type: multipart/form-data

**Form Data:**
- `image`: file (Required image file)
- `title`: string (Optional)
- `description`: string (Optional)
- `type`: string (Optional, "portfolio" or "scratch", default: "portfolio")
- `published`: boolean (Optional, default: true)
- `categoryIds`: string (Optional JSON array string, e.g., "[1,2,3]")

**Response (201):** Same format as Get Single Artwork

### Update Artwork
#### PUT /artworks/:id
**Requires Authentication**
Content-Type: multipart/form-data

**Form Data:**
- `image`: file (Optional new image file)
- `title`: string (Optional)
- `description`: string (Optional)
- `type`: string (Optional, "portfolio" or "scratch")
- `published`: boolean (Optional)
- `categoryIds`: string (Optional JSON array string)

**Response (200):** Same format as Get Single Artwork

### Delete Artwork
#### DELETE /artworks/:id
**Requires Authentication**

**Response (204):** No content

---

## Project Endpoints (`/projects`)

### Get All Projects (NO AUTH REQUIRED)
#### GET /projects
Get paginated list of all projects.

**Query Parameters:** Same as artworks

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "batch_image_path": ["string"],  // Array of image URLs
      "title": "string",
      "description": "string",
      "user_id": 1,
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "project_categories": [
        {
          "category": {
            "id": 1,
            "name": "string",
            "user_id": 1,
            "created_at": "timestamp",
            "updated_at": "timestamp"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 100,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Projects by User ID (NO AUTH REQUIRED)
#### GET /projects/user/:userId
Get paginated list of projects for a specific user.

**Query Parameters:** Same as Get All Projects

**Response (200):** Same format as Get All Projects

### Get Single Project (NO AUTH REQUIRED)
#### GET /projects/:id

**Response (200):**
```json
{
  "id": 1,
  "batch_image_path": ["string"],
  "title": "string",
  "description": "string",
  "user_id": 1,
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "project_categories": [...]
}
```

### Create Project
#### POST /projects
**Requires Authentication**
Content-Type: multipart/form-data

**Form Data:**
- `images`: file[] (Required, multiple image files, max 10)
- `title`: string (Required)
- `description`: string (Optional)
- `categoryIds`: string (Optional JSON array string)

**Response (201):** Same format as Get Single Project

### Update Project
#### PUT /projects/:id
**Requires Authentication**
Content-Type: multipart/form-data

**Form Data:**
- `modifiedImages`: file[] (Optional, replacement images)
- `addedImages`: file[] (Optional, new images to add)
- `title`: string (Optional)
- `description`: string (Optional)
- `categoryIds`: string (Optional JSON array string)
- `modifiedImageIndices`: string[] (Indices of images being modified)
- `removedImageIndices`: string (JSON array string of indices to remove)

**Response (200):** Same format as Get Single Project

### Delete Project
#### DELETE /projects/:id
**Requires Authentication**

**Response (204):** No content

---

## Animation Endpoints (`/animations`)

### Get All Animations (NO AUTH REQUIRED)
#### GET /animations
Get paginated list of all animations.

**Query Parameters:** Same as projects (page, limit, search, categoryIds)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "batch_video_path": ["string"],  // Array of video URLs
      "title": "string",
      "description": "string",
      "user_id": 1,
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "animation_categories": [
        {
          "category": {
            "id": 1,
            "name": "string",
            "user_id": 1,
            "created_at": "timestamp",
            "updated_at": "timestamp"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 100,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Get Animations by User ID (NO AUTH REQUIRED)
#### GET /animations/user/:userId
Get paginated list of animations for a specific user.

**Query Parameters:** Same as Get All Animations

**Response (200):** Same format as Get All Animations

### Get Current User's Animations (REQUIRES AUTHENTICATION)
#### GET /animations/my
Get current user's animations.

**Query Parameters:** Same as Get All Animations

**Response (200):** Same format as Get All Animations

### Get Single Animation (NO AUTH REQUIRED)
#### GET /animations/:id

**Response (200):**
```json
{
  "id": 1,
  "batch_video_path": ["string"],
  "title": "string",
  "description": "string",
  "user_id": 1,
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "animation_categories": [...]
}
```

### Create Animation
#### POST /animations
**Requires Authentication**
Content-Type: multipart/form-data

**Form Data:**
- `videos`: file[] (Required, multiple video files, max 10, max 100MB each)
- `title`: string (Required)
- `description`: string (Optional)
- `categoryIds`: string (Optional JSON array string)

**Supported Video Formats:**
- MP4 (video/mp4)
- MPEG (video/mpeg)
- QuickTime/MOV (video/quicktime)
- AVI (video/x-msvideo)
- WebM (video/webm)

**Response (201):** Same format as Get Single Animation

### Update Animation
#### PUT /animations/:id
**Requires Authentication**
Content-Type: multipart/form-data

**Form Data:**
- `modifiedVideos`: file[] (Optional, replacement videos)
- `addedVideos`: file[] (Optional, new videos to add)
- `title`: string (Optional)
- `description`: string (Optional)
- `categoryIds`: string (Optional JSON array string)
- `modifiedVideoIndices`: string[] (Indices of videos being modified)
- `removedVideoIndices`: string (JSON array string of indices to remove)

**Response (200):** Same format as Get Single Animation

### Delete Animation
#### DELETE /animations/:id
**Requires Authentication**

**Response (204):** No content

---

## Category Endpoints (`/categories`)

### Get All Categories (NO AUTH REQUIRED)
#### GET /categories

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "string",
    "user_id": 1,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

### Create Category
#### POST /categories
**Requires Authentication**

**Request Body:**
```json
{
  "name": "string"  // Required
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "string",
  "user_id": 1,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Update Category
#### PUT /categories/:id
**Requires Authentication**

**Request Body:**
```json
{
  "name": "string"  // Required
}
```

**Response (200):** Same format as Create Category

### Delete Category
#### DELETE /categories/:id
**Requires Authentication**

**Response (204):** No content

---

## Error Responses

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Error message describing what went wrong"
}
```

#### 401 Unauthorized
```json
{
  "error": "Invalid credentials" | "Token required" | "Invalid token"
}
```

#### 404 Not Found
```json
{
  "error": "Resource not found" | "User not found" | "Artwork not found"
}
```

#### 409 Conflict
```json
{
  "error": "Email already in use" | "Resource already exists"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to perform operation",
  "message": "Additional error details (in development mode)"
}
```

---

## Important Notes

1. All timestamps are in ISO 8601 format
2. File uploads use multipart/form-data content type
3. JSON requests use application/json content type
4. Bearer tokens should be included in Authorization header for protected routes
5. **Read operations (GET) for artworks, categories, and projects do NOT require authentication**
6. **New user-specific endpoints allow fetching content by user ID without authentication**
7. Image files are uploaded to Cloudflare R2 storage
8. Profile images have a 5MB size limit
9. Project uploads support up to 10 images at once
10. Category IDs in query parameters should be JSON-encoded arrays as strings
11. User profile by ID endpoint excludes email for privacy reasons