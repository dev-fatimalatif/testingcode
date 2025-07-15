import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { AWS_COGNITO_USER_POOL_ID, AWS_COGNITO_CLIENT_ID, AWS_REGION } from '@config';
import { CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProvider({ region: AWS_REGION });
export { cognito };
