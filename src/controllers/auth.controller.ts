import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { tryCatchHandler } from '@/middlewares/error.middleware';
import { responseHandler } from '@/utils/responseHandler';
import HttpStatus from '@/constants/HttpStatus';
import { AuthService } from '@/services/auth.service';
import { getAuthorization } from '@/middlewares/auth.middleware';
import { HttpException } from '@/exceptions/HttpException';
import { User } from '@/interfaces/users.interface';

const setCookie = (res: Response, name, { token, expiresIn }, options = {}) => {
  const cookieOptions = {
    maxAge: expiresIn, // Default: 1 day
    httpOnly: true, // Prevents client-side access
    sameSite: 'none',
    // ...options, // Spread any additional options
    secure: true, // Set to true if using HTTPS
    path: '/',
    // sameSite: 'none',
    ...options, // Spread any additional options
  };
  res.cookie(name, token, cookieOptions);
};

const ONE_MONTH_SECONDS = 30 * 40 * 60 * 60;

export class AuthController {
  public awsAuth = Container.get(AuthService);
  // AWS Signup endpoint
  public awsSignUp = tryCatchHandler(async (req: Request, res: Response) => {
    const saveUser = await this.awsAuth.awsSignUp(req.body);
    responseHandler(res, { data: saveUser, message: 'signup', statusCode: HttpStatus.CREATED });
  });
  // AWS Login endpoint
  public awsLogin = tryCatchHandler(async (req: Request, res: Response) => {
    // console.log("checking the body",req.body);
    const {  password, newPassword, confirmPassword } = req.body;
    const email= req.body.email.toLowerCase();
    const userCredentials = {
      email,
      password,
      newPassword,
  confirmPassword,
    };
    const { token, user: data } = await this.awsAuth.awsLogin(userCredentials);

    setCookie(res, 'accessToken', { token: token.AccessToken, expiresIn: token.ExpiresIn * 1000 });
    setCookie(res, 'refreshToken', { token: token.RefreshToken, expiresIn: ONE_MONTH_SECONDS * 1000 });
    responseHandler(res, { data, message: 'login', statusCode: HttpStatus.OK });
  });

  // public generateAccessToken = tryCatchHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
  //   try {
  //     const Authorization = getAuthorization(req, 'refreshToken');
  //     if (Authorization) {
  //       const USER = (await verify(Authorization, REFRESH_SECRET_KEY)) as DataStoredInToken;
  //       const findUser = await UserModel.findById(USER._id);
  //       if (findUser) {
  //         setCookie(res, 'accessToken', createAccessTokenToken(findUser));
  //         responseHandler(res, { data: undefined, message: 'access-token', statusCode: HttpStatus.OK });
  //       } else {
  //         next(new HttpException(HttpStatus.UNAUTHORIZED, 'invalid refresh authentication'));
  //       }
  //     } else {
  //       next(new HttpException(HttpStatus.UNAUTHORIZED, 'UnAuthorized'));
  //     }
  //   } catch (error) {
  //     next(new HttpException(HttpStatus.UNAUTHORIZED, 'UnAuthorized catch'));
  //   }
  // });

  public regenerateAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const Authorization = getAuthorization(req, 'refreshToken');

      if (Authorization) {
        const userCredentials = {
          email,
          refreshToken: Authorization,
        };
        const token = await this.awsAuth.regenerateAccessToken(userCredentials);

        setCookie(res, 'accessToken', { token: token.AccessToken, expiresIn: token.ExpiresIn * 1000 });
        responseHandler(res, { data: undefined, message: 'access-token', statusCode: HttpStatus.OK });
      } else {
        next(new HttpException(HttpStatus.UNAUTHORIZED, 'UnAuthorized'));
      }
    } catch (error) {
      console.log({ error });
      next(new HttpException(HttpStatus.UNAUTHORIZED, 'UnAuthorized catch'));
    }
  };

  public logOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const logOutUserData: User = await this.awsAuth.logout(userData);

      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      responseHandler(res, { data: logOutUserData, message: 'logout', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };
  // //  Forgot Password endpoint for Aws Cognito
  // public forgotPassword = tryCatchHandler(async (req: Request, res: Response, next: NextFunction) => {
  //   const { email, password, confirmPassword, verificationCode } = req.body;
  //   // Check if this is an initiation or confirmation request
  //   let result;
  //   if (!verificationCode) {
  //     // Step 1: Initiate password reset (send verification code to user's email)
  //     result = await this.awsAuth.initiateForgotPassword(email);
  //     responseHandler(res, { data: result, message: 'Verification code sent to email', statusCode: HttpStatus.OK });
  //   } else {
  //     if (password !== confirmPassword) {
  //       throw new HttpException(HttpStatus.BAD_REQUEST, 'Passwords do not match.');
  //     }
  //     result = await this.awsAuth.confirmForgotPassword(email, password, verificationCode);
  //     responseHandler(res, { data: result, message: 'Password reset successful.', statusCode: HttpStatus.OK });
  //   }
  // });
  // // // AWS Change password endpoint (once user is logged in)
  // public changePassword = tryCatchHandler(async (req: Request, res: Response, next: NextFunction) => {
  //   const { email, oldPassword, newPassword } = req.body;
  //   const result = await this.awsAuth.changePassword(email, oldPassword, newPassword);
  //   responseHandler(res, { data: result, message: 'Password changed successfully!', statusCode: HttpStatus.OK });
  // });

  // // Forgot Password Endpoint
  // public forgotPassword = tryCatchHandler(async (req: Request, res: Response) => {
  //   const { email } = req.body;
  //   // Call the service to generate the reset token and send an email
  //   await this.awsAuth.forgotPassword(email);
  //   responseHandler(res, { message: 'Password reset link sent to email', statusCode: HttpStatus.OK });
  // });

  // // Reset Password Endpoint
  // public resetPassword = tryCatchHandler(async (req: Request, res: Response) => {
  //   const { token, newPassword } = req.body;
  //   // Call the service to verify the token and reset the password
  //   await this.awsAuth.resetPassword(token, newPassword);
  //   responseHandler(res, { message: 'Password reset successfully', statusCode: HttpStatus.OK });
  // });

  // Forgot Password Endpoint
  public forgotPassword = tryCatchHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await this.awsAuth.forgotPassword(email); // Initiate password reset
    responseHandler(res, { data: {message: 'Password reset link sent to email',success:true}, message: 'Password reset link sent to email', statusCode: HttpStatus.OK });
  });

  // Reset Password Endpoint
  public resetPassword = tryCatchHandler(async (req: Request, res: Response) => {
    const { email, newPassword, verificationCode } = req.body;
    await this.awsAuth.resetPassword(email, newPassword, verificationCode); // Reset the password
    responseHandler(res, { data: {message: 'Password reset successfully',success:true}, message: 'Password reset successfully', statusCode: HttpStatus.OK });
  });



}
