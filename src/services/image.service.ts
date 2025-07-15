import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { NODE_ENV } from '@/config';

const generateFileName = (originalName: string): string => {
  // Generate a unique filename based on the original name and a UUID
  const baseName = path.basename(originalName, path.extname(originalName));
  const uniqueName = `${baseName}-${Date.now()}${path.extname(originalName)}`;
  return uniqueName;
};

const storage =
  NODE_ENV === 'production'
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (req, file, cb) => {
          const uploadsDir = path.join(__dirname, '../assets');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
          }
          cb(null, 'src/assets/');
        },
        filename: (req, file, cb) => {
          cb(null, generateFileName(file.originalname));
        },
      });

const upload = multer({ storage: storage });

export { upload, generateFileName };
