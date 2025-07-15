import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';

// Setup AWS S3 for production
const s3 = new AWS.S3();
const BUCKET_NAME = 'your-s3-bucket-name';

// Helper function to generate unique filenames
const generateFileName = (originalName: string): string => {
  return `${uuidv4()}-${Date.now()}${path.extname(originalName)}`;
};

// Service to handle file uploads
class ImageService {
  // Method to upload file
  static async uploadFile(file: Express.Multer.File): Promise<string> {
    if (process.env.NODE_ENV === 'production') {
      // In production, upload to S3
      return this.uploadToS3(file);
    } else {
      // In development, save to disk
      return this.saveToDisk(file);
    }
  }

  // Upload to S3 (production)
  private static async uploadToS3(file: Express.Multer.File): Promise<string> {
    const fileName = generateFileName(file.originalname);

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Adjust according to your use case
    };

    try {
      const data = await s3.upload(params).promise();
      console.log('File uploaded successfully to S3:', data.Location);
      return data.Location; // Return the S3 URL
    } catch (err) {
      console.error('Error uploading file to S3:', err);
      throw new Error('Error uploading to S3');
    }
  }

  // Save file to disk (development)
  private static saveToDisk(file: Express.Multer.File): string {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = generateFileName(file.originalname);
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return filePath; // Return the file path
  }
}

export default ImageService;
