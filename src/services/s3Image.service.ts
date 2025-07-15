import { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_S3_BUCKET, AWS_SECRET_ACCESS_KEY } from '@/config';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
} from '@aws-sdk/client-s3'; // Import the necessary S3 methods
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; // For generating presigned URLs
import { Service } from 'typedi';
import { generateFileName } from './image.service';

export interface PutObjectPreSignedUrlI {
  fileName: string;
  userId: string;
  type: string;
}

export interface GETObjectPreSignedUrlI {
  key: string;
}

@Service()
export class S3ImageService {
  private s3Client: S3Client;

  constructor() {
    // Initialize S3 Client
    this.s3Client = new S3Client({
      region: AWS_REGION, // Replace with your region
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID, // From .env or environment variable
        secretAccessKey: AWS_SECRET_ACCESS_KEY, // From .env or environment variable
      },
    });
  }
  // Method to generate pre-signed URL for file upload
  public async generatePreSignedUrlForUpload(param: PutObjectPreSignedUrlI): Promise<{ url: string; key: string }> {
    const { fileName, userId, type } = param;
    const key = [type, userId, generateFileName(fileName)].join('/'); // Unique file name for S3
    //   console.log({ key, AWS_S3_BUCKET });
    const params: PutObjectCommandInput = {
      Bucket: AWS_S3_BUCKET,
      Key: key,
      // ContentType: 'image/jpeg', // MIME type of the file
    };

    try {
      const command = new PutObjectCommand(params);
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // Generate the pre-signed URL
      return { url, key };
    } catch (err) {
      console.error('Error generating pre-signed URL', err);
      throw new Error('Error generating URL');
    }
  }

  public async generatePreSignedUrlForRetrieve(param: GETObjectPreSignedUrlI): Promise<string> {
    const { key } = param;
    const params: GetObjectCommandInput = {
      Bucket: AWS_S3_BUCKET,
      Key: key,
      // ContentType: fileType, // MIME type of the file
    };

    try {
      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // Generate the pre-signed URL
      return url;
    } catch (err) {
      console.error('Error generating pre-signed URL', err);
      throw new Error('Error generating URL');
    }
  }

  public async deleteObject(fileKey: string): Promise<DeleteObjectCommandOutput> {
    const params: GetObjectCommandInput = {
      Bucket: AWS_S3_BUCKET,
      Key: fileKey,
      // ContentType: fileType, // MIME type of the file
    };

    try {
      const command = new DeleteObjectCommand(params);
      const data = await this.s3Client.send(command); // 'Body' will be a readable stream
      console.log({ data });
      return data;
    } catch (err) {
      console.error('Error deleting bucket object', err);
      throw new Error('Error deleting file');
    }
  }
  public async getObject(fileKey: string): Promise<Buffer> {
    const params: GetObjectCommandInput = {
      Bucket: AWS_S3_BUCKET,
      Key: fileKey,
      // ContentType: fileType, // MIME type of the file
    };

    try {
      const command = new GetObjectCommand(params);
      const { Body } = await this.s3Client.send(command); // 'Body' will be a readable stream

      // Read the stream into a buffer
      const chunks = [];
      for await (const chunk of Body) {
        chunks.push(chunk);
      }
      const fileBuffer = Buffer.concat(chunks);
      return fileBuffer;
    } catch (err) {
      console.error('Error generating pre-signed URL', err);
      throw new Error('Error generating URL');
    }
  }

  // public async uploadImage(file: File): Promise<any> {
  //   console.log({ file });
  //   const params = {
  //     Bucket: AWS_S3_BUCKET,
  //     Key: generateFileName(file.originalname), // The file name to be used in S3
  //     Body: file.buffer, // The uploaded file in memory
  //     ContentType: file.mimetype, // The mime type of the file
  //   };
  //   try {
  //     // Generate pre-signed URL for reading the object
  //     const data = await s3Client.send(new PutObjectCommand(params));
  //     console.log({ data });
  //     if (data?.$metadata?.httpStatusCode === HttpStatus.OK) {
  //     }
  //     // const url = await getSignedUrl(s3Client, command); //await s3Client.send(command);
  //     return data;
  //   } catch (err) {
  //     console.error('Error generating pre-signed URL', err);
  //     throw new HttpException(422, 'Error generating URL');
  //   }
  // }
}
