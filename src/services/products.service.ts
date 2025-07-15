import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { AddSubProductI, AddSubProductResponseI, ProductsI, ProductsReponseI, SubProductRecordI } from '@interfaces/products.interface';
import { ProductModel } from '@models/products.model';
import mongoose from 'mongoose';

@Service()
export class ProductService {
  public async findAllProduct(): Promise<ProductsI[]> {
    const Products: ProductsI[] = await ProductModel.find();
    return Products;
  }

  public async findProductById(ProductId: string): Promise<ProductsI> {
    const findProduct: ProductsI = await ProductModel.findOne({ _id: ProductId });
    if (!findProduct) throw new HttpException(409, "Product doesn't exist");

    return findProduct;
  }

  public async createProduct(ProductData: ProductsI): Promise<ProductsI> {
    const createProductData: ProductsI = await ProductModel.create(ProductData);
    return createProductData;
  }

  public async createMultiProduct(ProductData: Array<ProductsI>): Promise<Array<ProductsReponseI>> {
    const createProductData: Array<ProductsReponseI> = await ProductModel.insertMany(ProductData);
    return createProductData;
  }

  public async updateProduct(ProductId: string, ProductData: ProductsI): Promise<ProductsI> {
    const updateProductById: ProductsI = await ProductModel.findByIdAndUpdate(ProductId, { ProductData });
    if (!updateProductById) throw new HttpException(409, "Product doesn't exist");

    return updateProductById;
  }

  public async AddSubProduct(ProductId: mongoose.Types.ObjectId, subProducts: AddSubProductI): Promise<AddSubProductResponseI> {
    const updateProductSub: ProductsI = await ProductModel.findByIdAndUpdate(
      ProductId,
      {
        $push: {
          subProducts: {
            $each: [...new Set(subProducts)],
            $position: 0,
          },
        },
      },
      { new: true },
    );

    if (!updateProductSub) throw new HttpException(409, "Product for sub product doesn't exist");

    const subProductsName = subProducts.map(({ name }) => name);
    const newAddedSubProducts: AddSubProductResponseI = updateProductSub.subProducts.filter(({ name }) => subProductsName.includes(name));

    return newAddedSubProducts;
  }
  public async deleteProduct(ProductId: string): Promise<ProductsI> {
    const deleteProductById: ProductsI = await ProductModel.findByIdAndDelete(ProductId);
    if (!deleteProductById) throw new HttpException(409, "Product doesn't exist");

    return deleteProductById;
  }

  public async bulkCheckAndCreateProducts(productNames: string[]): Promise<{ existing: ProductsI[], created: ProductsI[] }> {
    // Convert all input names to lowercase
    const lowercaseNames = productNames.map(name => name.toLowerCase());
    
    // Find existing products (case-insensitive)
    const existingProducts = await ProductModel.find({ 
      name: { 
        $in: lowercaseNames.map(name => new RegExp(`^${name}$`, 'i'))
      } 
    });
    
    const existingNames = existingProducts.map(p => p.name.toLowerCase());
    
    // Find names that don't exist (case-insensitive)
    const newNames = productNames.filter(name => 
      !existingNames.includes(name.toLowerCase())
    );
    
    // Create new products
    const newProducts = await ProductModel.create(
      newNames.map(name => ({ name }))
    );

    return {
      existing: existingProducts,
      created: newProducts
    };
  }
}
