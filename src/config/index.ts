import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { NODE_ENV, PORT, ACCESS_SECRET_KEY, REFRESH_SECRET_KEY, LOG_FORMAT, LOG_DIR, ORIGIN, PROMPT_API_BASE_PATH } = process.env;
export const { CONNECTION_URI, DB_DATABASE } = process.env;
export const {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET,
  AWS_COGNITO_USER_POOL_ID,
  AWS_COGNITO_CLIENT_ID,
  AWS_COGNITO_CLIENT_SECRET,
} = process.env;
