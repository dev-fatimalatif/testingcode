import Container, { Service } from 'typedi';
import { ProductService } from './products.service';
import { RegionService } from './regions.service';
import { ProductsI } from '@/interfaces/products.interface';
import { RegionsI } from '@/interfaces/regions.interface';
import axios from 'axios';

@Service()
export class LibraryTrainingService {
  public productService = Container.get(ProductService);
  public regionService = Container.get(RegionService);

  public async libraryDataTraining(token: string, body: any): Promise<any> {
    const {
      date,             // e.g. "2024" or 2024
      products = [],    // e.g. ["67b4c17bd1fd59b3fef6ea5d", "67b4c00f4c77a5c8a29c7a5d"]
      regions = [],     // e.g. ["670fb58ed93a5148553084a1", "6750387e8c98ddc8701a8aa5"]
      excelSheetData = {},
    } = body;

    // 1. Call transformDataFilters with 'await'
    const filters = await this.transformDataFilters(date, products, regions);

    console.log('filters:', filters);

    // for (const [category, items] of Object.entries(excelSheetData)) {
    //   if (Array.isArray(items)) {
    //     for (const item of items) {
    //       const response = await axios.post(
    //         'http://localhost:8000/updateKG',
    //         {
    //           question: item.question,
    //           answer: item.answer,
    //           filters,
    //           // If you want to keep track of the category, you can also add:
    //           // category,
    //         },           // The data to send
    //         {
    //           headers: {
    //             Authorization: `Bearer ${token}`, // If needed
    //             'Content-Type': 'application/json',
    //           },
    //         },
    //       );
    //     }}}

// calling parallel api calls.
        for (const [category, items] of Object.entries(excelSheetData)) {
          if (Array.isArray(items)) {
            // 1) Create an array of promises
            const promises = items.map(item => {
              return axios.post(
                'http://localhost:8000/updateKG',
                {
                  question: item.question,
                  answer: item.answer,
                  filters,
                  // category, if needed
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`, 
                    'Content-Type': 'application/json',
                  },
                },
              );
            });
        
            // 2) Run all requests in parallel
            //    Promise.all will wait until ALL requests have resolved or one rejects
            await Promise.all(promises);
          }
        }

    // 2. Return the filters (or a bigger object if you also want to include excelSheetData)
    // return {
    //   ...filters,
    //   excelSheetData,
    // };
  }

  // Adjust the type for `date` if needed
  public async transformDataFilters(
    date: string | number,
    products: string[],
    regions: string[],
  ): Promise<any> {
    // 2. Fetch product names from product IDs
    const productNames: string[] = [];
    for (const productId of products) {
      const productDoc: ProductsI = await this.productService.findProductById(productId);
      productNames.push(productDoc.name);
    }

    // 3. Fetch region names from region IDs
    const regionNames: string[] = [];
    for (const regionId of regions) {
      const regionDoc: RegionsI = await this.regionService.findRegionById(regionId);
      regionNames.push(regionDoc.name);
    }

    console.log('Product names:', productNames);
    console.log('Region names:', regionNames);

    // Return the filters structure
    return {
      
        regions: regionNames,
        products: productNames,
        date: String(date),
      
    };
  }
}
