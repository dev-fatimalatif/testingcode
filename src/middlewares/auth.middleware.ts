import { NextFunction, Request, Response } from 'express';
import { AWS_COGNITO_USER_POOL_ID, AWS_REGION } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { UserModel } from '@models/users.model';
import HttpStatus from '@/constants/HttpStatus';
import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';
import { RoleEnum, RolePermissionsEnum, RolePermissionsI } from '@/interfaces/permissions.interface';

export const getAuthorization = (req: Request, tokenType: 'accessToken' | 'refreshToken') => {
  const coockie = req.cookies[tokenType];
  if (coockie) return coockie;

  const header = req.header(tokenType);
  if (header) return header.split('Bearer ')[1];

  return null;
};

const JWKS_URI = `https://cognito-idp.${AWS_REGION}.amazonaws.com/${AWS_COGNITO_USER_POOL_ID}/.well-known/jwks.json`;

const client = jwksClient({
  jwksUri: JWKS_URI,
});

// Function to get the signing key
const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey?.();
    callback(null, signingKey);
  });
};

// Verify the token
const verifyToken = async token => {
  try {
    // Decode the token
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader) {
      throw new Error('Invalid token');
    }

    // Verify the token using the signing key
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        getKey,
        {
          issuer: `https://cognito-idp.${AWS_REGION}.amazonaws.com/${AWS_COGNITO_USER_POOL_ID}`,
          algorithms: ['RS256'],
        },
        (err, decoded) => {
          if (err) {
            // throw new Error('Token verification failed: ' + err.message);
            return reject(err.message);
          }
          // console.log('Token is valid:', decoded);
          return resolve(decoded);
        },
      );
    });
  } catch (error) {
    console.error('Error verifying token:', error.message);
  }
};

export const AuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("AuthMiddleware called");
    const Authorization = getAuthorization(req, 'accessToken');
    if (Authorization) {
      const USER = await verifyToken(Authorization);
      
      const findUser = await UserModel.findOne({ cognitoUserId: (USER as any).sub })
        .populate('role')
        .lean();
      // console.log({ findUser: (findUser as any).role }, (findUser as any).role.name === RoleEnum.PROJECT_CREATOR);
      // console.log({findUser},'AK47-Intern')
      if (findUser) {
        req.user = {...findUser, token:Authorization} as any;
        // console.log('req.user', req.user);
        next();
      } else {
        next(new HttpException(HttpStatus.UNAUTHORIZED, 'Wrong access token authentication'));
      }
    } else {
      next(new HttpException(HttpStatus.UNAUTHORIZED, 'access token missing'));
    }
  } catch (error) {
    next(new HttpException(HttpStatus.UNAUTHORIZED, 'Wrong access token authentication'));
  }
};

export const checkPermissions = (permission: RolePermissionsEnum) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isUserAuthorized = (req.user.role?.permissions ?? []).includes(permission);

    if (!isUserAuthorized) next(new HttpException(HttpStatus.UNAUTHORIZED, 'You are not authorize'));
    next();
  } catch (error) {
    console.log('error message', error);
    next(new HttpException(HttpStatus.UNAUTHORIZED, 'You are not authorize exception'));
  }
};
