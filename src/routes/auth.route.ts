import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { AuthController } from '@/controllers/auth.controller';

export class AuthRoute implements Routes {
  public path = '/auth/';
  public router = Router();
  public auth = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}signup`, this.auth.awsSignUp);
    this.router.post(`${this.path}login`, this.auth.awsLogin);
    this.router.post(`${this.path}access-token`, this.auth.regenerateAccessToken);
    this.router.post(`${this.path}logout`, AuthMiddleware, this.auth.logOut);


    // // Forgot Password and Change Password routes
    // this.router.post(`${this.path}forgot-password`, this.auth.forgotPassword);
    // this.router.post(`${this.path}change-password`, AuthMiddleware, this.auth.changePassword);  // Protected route

    // Forgot Password and Reset Password routes
    this.router.post(`${this.path}forgot-password`, this.auth.forgotPassword);
    this.router.post(`${this.path}reset-password`, this.auth.resetPassword);
  }
}
