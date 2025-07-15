import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { responseHandler } from '@/utils/responseHandler';
import HttpStatus from '@/constants/HttpStatus';
import { ProductService } from '@/services/products.service';
import { AddSubProductI, ProductsI } from '@/interfaces/products.interface';
import mongoose from 'mongoose';
import { HttpException } from '@/exceptions/HttpException';

export class ProductController {
  public Product = Container.get(ProductService);

  public getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllProductsData: ProductsI[] = await this.Product.findAllProduct();

      responseHandler(res, { data: findAllProductsData, message: 'findAll', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ProductId: string = req.params.id;
      const findOneProductData: ProductsI = await this.Product.findProductById(ProductId);

      responseHandler(res, { data: findOneProductData, message: 'findOne', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ProductData: ProductsI = req.body;
      const createProductData: ProductsI = await this.Product.createProduct(ProductData);

      responseHandler(res, { data: createProductData, message: 'created', statusCode: HttpStatus.CREATED });
    } catch (error) {
      next(error);
    }
  };

  public updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ProductId: string = req.params.id;
      const ProductData: ProductsI = req.body;
      const updateProductData: ProductsI = await this.Product.updateProduct(ProductId, ProductData);

      responseHandler(res, { data: updateProductData, message: 'updated', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public AddSubProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ProductId: string = req.params.id;
      const ProductData: ProductsI = req.body;
      const updateProductData: any = await this.Product.AddSubProduct(ProductId as unknown as mongoose.Types.ObjectId, ProductData.subProducts);

      responseHandler(res, { data: updateProductData, message: 'updated', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ProductId: string = req.params.id;
      const deleteProductData: ProductsI = await this.Product.deleteProduct(ProductId);

      responseHandler(res, { data: deleteProductData, message: 'deleted', statusCode: HttpStatus.OK });
    } catch (error) {
      next(error);
    }
  };

  public bulkCheckAndCreateProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { products } = req.body;
      
      if (!Array.isArray(products)) {
        throw new HttpException(HttpStatus.BAD_REQUEST, 'Products must be an array');
      }

      const result = await this.Product.bulkCheckAndCreateProducts(products);
      responseHandler(res, { 
        data: result, 
        message: 'Products processed successfully', 
        statusCode: HttpStatus.OK 
      });
    } catch (error) {
      next(error);
    }
  };
}
