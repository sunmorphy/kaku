import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME) {
    console.error("Missing required R2 environment variables. Please check your .env file.");
}

// Initialize S3 client for Cloudflare R2
const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

export interface R2UploadResult {
    fileId: string;
    name: string;
    url: string;
    thumbnailUrl: string;
    height: number;
    width: number;
    size: number;
    filePath: string;
    tags?: string[] | null;
    isPrivateFile?: boolean | null;
    customCoordinates?: string | null;
}

export const uploadToR2 = async (file: Buffer, fileName: string, username: string, subFolder?: string): Promise<R2UploadResult> => {
    try {
        // Sanitize filename
        const sanitizedFileName = sanitizeFileName(fileName);
        const folderPath = subFolder ? `${username}/${subFolder}` : username;
        const filePath = `${folderPath}/${sanitizedFileName}`;
        const bucketName = process.env.R2_BUCKET_NAME!;
        const publicUrl = process.env.R2_PUBLIC_URL!;

        // Determine content type
        const contentType = getContentType(fileName);

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: filePath,
            Body: file,
            ContentType: contentType,
        });

        await r2Client.send(command);

        // Construct the public URL
        const url = `${publicUrl}/${filePath}`;

        return {
            fileId: generateFileId(filePath),
            name: sanitizedFileName,
            url: url,
            thumbnailUrl: url, // R2 doesn't auto-generate thumbnails, using same URL
            height: 0, // R2 doesn't provide image dimensions automatically
            width: 0,
            size: file.length,
            filePath: filePath,
            tags: null,
            isPrivateFile: false,
            customCoordinates: null,
        };
    } catch (error) {
        throw new Error(`R2 upload failed: ${error}`);
    }
};

export const uploadProfileImageToR2 = async (file: Buffer, fileName: string, username: string): Promise<R2UploadResult> => {
    try {
        // Sanitize filename
        const sanitizedFileName = sanitizeFileName(fileName);
        const filePath = `${username}/${sanitizedFileName}`;
        const bucketName = process.env.R2_BUCKET_NAME!;
        const publicUrl = process.env.R2_PUBLIC_URL!;

        // Determine content type
        const contentType = getContentType(fileName);

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: filePath,
            Body: file,
            ContentType: contentType,
        });

        await r2Client.send(command);

        // Construct the public URL
        const url = `${publicUrl}/${filePath}`;

        return {
            fileId: generateFileId(filePath),
            name: sanitizedFileName,
            url: url,
            thumbnailUrl: url,
            height: 0,
            width: 0,
            size: file.length,
            filePath: filePath,
            tags: null,
            isPrivateFile: false,
            customCoordinates: null,
        };
    } catch (error) {
        throw new Error(`Profile image upload failed: ${error}`);
    }
};

// Helper function to sanitize filename
function sanitizeFileName(fileName: string): string {
    return fileName
        .replace(/\s+/g, '-')  // Replace spaces with hyphens
        .replace(/[^\w\-\.]/g, '')  // Remove special characters except hyphen, underscore, dot
        .replace(/\-+/g, '-')  // Replace multiple hyphens with single hyphen
        .toLowerCase();  // Convert to lowercase for consistency
}

// Helper function to determine content type
function getContentType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    const mimeTypes: { [key: string]: string } = {
        // Images
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        'bmp': 'image/bmp',
        'ico': 'image/x-icon',

        // Videos
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'ogg': 'video/ogg',
        'mov': 'video/quicktime',
        'avi': 'video/x-msvideo',
        'mkv': 'video/x-matroska',
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
}

// Helper function to generate a unique file ID
function generateFileId(filePath: string): string {
    return Buffer.from(filePath).toString('base64');
}
