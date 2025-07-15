import { Router } from 'express';
import { ProductController } from '@/controllers/products.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class ProductRoute implements Routes {
  public path = '/products';
  public router = Router();
  public product = new ProductController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(this.path, AuthMiddleware);
    this.router.get(`${this.path}`, this.product.getProducts);
    this.router.get(`${this.path}/:id`, this.product.getProductById);

    this.router.post(`${this.path}`, this.product.createProduct);
    this.router.post(`${this.path}/bulk-check`, this.product.bulkCheckAndCreateProducts);
    this.router.put(`${this.path}/:id`, this.product.updateProduct);
    this.router.put(`${this.path}/sub-products/:id`, this.product.AddSubProduct);
    this.router.delete(`${this.path}/:id`, this.product.deleteProduct);
  }
}
