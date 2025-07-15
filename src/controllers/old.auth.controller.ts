// import { NextFunction, Request, Response } from 'express';
// import { Container } from 'typedi';
// import { DataStoredInToken, RequestWithUser, TokenData } from '@interfaces/auth.interface';
// import { User, UserResponse } from '@interfaces/users.interface';
// import { AuthService } from '@/services/old.auth.service';
// import { tryCatchHandler } from '@/middlewares/error.middleware';
// import { responseHandler } from '@/utils/responseHandler';
// import HttpStatus from '@/constants/HttpStatus';
// import { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } from '@config';
// import { sign, verify } from 'jsonwebtoken';
// import { HttpException } from '@/exceptions/HttpException';
// import { getAuthorization } from '@/middlewares/auth.middleware';
// import { UserModel } from '@/models/users.model';

// //Utility function to set a reusable cookie
// const setCookie = (res: Response, name, { token, expiresIn }, options = {}) => {
//   const cookieOptions = {
//     maxAge: expiresIn, // Default: 1 day
//     httpOnly: false, // Prevents client-side access
//     secure: false, // Set to true if using HTTPS
//     path: '/',
//     // sameSite: 'none',
//     ...options, // Spread any additional options
//   };
//   res.cookie(name, token, cookieOptions);
// };

// const createAccessTokenToken = (user: UserResponse): TokenData => {
//   const dataStoredInToken: DataStoredInToken = { _id: user.id };
//   const expiresIn = 60 * 60 * 1000; // 60 minutes //'15m'; // 60 * 15;

//   return { expiresIn, token: sign(dataStoredInToken, ACCESS_SECRET_KEY, { expiresIn }) };
// };

// const createRefreshTokenToken = (user: UserResponse): TokenData => {
//   const dataStoredInToken: DataStoredInToken = { _id: user.id };
//   const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days

//   return { expiresIn, token: sign(dataStoredInToken, REFRESH_SECRET_KEY, { expiresIn }) };
// };

// export class AuthController {
//   public auth = Container.get(AuthService);

//   public signUp = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const userData: User = req.body;
//       const signUpUserData: UserResponse = await this.auth.signup(userData);
//       // res.status(201).json({ data: signUpUserData, message: 'signup' });
//       responseHandler(res, { data: signUpUserData, message: 'signup', statusCode: HttpStatus.CREATED });
//     } catch (error) {
//       next(error);
//     }
//   };

//   public logIn = tryCatchHandler(async (req: Request, res: Response) => {
//     const userData: User = req.body;
//     const findUser = await this.auth.login(userData);
//     setCookie(res, 'accessToken', createAccessTokenToken(findUser));
//     setCookie(res, 'refreshToken', createRefreshTokenToken(findUser));
//     responseHandler(res, { data: findUser, message: 'login', statusCode: HttpStatus.OK });
//   });

//   public generateAccessToken = tryCatchHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
//     try {
//       const Authorization = getAuthorization(req, 'refreshToken');
//       if (Authorization) {
//         const USER = (await verify(Authorization, REFRESH_SECRET_KEY)) as DataStoredInToken;
//         const findUser = await UserModel.findById(USER._id);
//         if (findUser) {
//           setCookie(res, 'accessToken', createAccessTokenToken(findUser));
//           responseHandler(res, { data: undefined, message: 'access-token', statusCode: HttpStatus.OK });
//         } else {
//           next(new HttpException(HttpStatus.UNAUTHORIZED, 'invalid refresh authentication'));
//         }
//       } else {
//         next(new HttpException(HttpStatus.UNAUTHORIZED, 'UnAuthorized'));
//       }
//     } catch (error) {
//       next(new HttpException(HttpStatus.UNAUTHORIZED, 'UnAuthorized catch'));
//     }
//   });

//   public logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
//     try {
//       const userData: User = req.user;
//       const logOutUserData: User = await this.auth.logout(userData);

//       res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
//       responseHandler(res, { data: logOutUserData, message: 'logout', statusCode: HttpStatus.OK });
//     } catch (error) {
//       next(error);
//     }
//   };
// }
