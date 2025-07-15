import { UserTokenData } from '@/interfaces/users.interface';
import { File } from 'multer';

declare global {
  namespace Express {
    interface Request {
      file?: File; // Optional file property
      user: UserTokenData;
    }
  }
}
