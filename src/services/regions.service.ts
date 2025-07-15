import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { RegionsI } from '@interfaces/regions.interface';
import { RegionModel } from '@models/regions.model';

@Service()
export class RegionService {
  public async findAllRegion(): Promise<RegionsI[]> {
    const regions: RegionsI[] = await RegionModel.find();
    return regions;
  }

  public async findRegionById(regionId: string): Promise<RegionsI> {
    const findRegion: RegionsI = await RegionModel.findOne({ _id: regionId });
    if (!findRegion) throw new HttpException(409, "Region doesn't exist");

    return findRegion;
  }

  public async createRegion(regionData: RegionsI): Promise<RegionsI> {
    const createRegionData: RegionsI = await RegionModel.create(regionData);
    return createRegionData;
  }

  public async createMultiRegion(regionData: Array<RegionsI>): Promise<Array<RegionsI>> {
    const createRegionData: Array<RegionsI> = await RegionModel.insertMany(regionData);
    return createRegionData;
  }

  public async updateRegion(regionId: string, regionData: RegionsI): Promise<RegionsI> {
    const updateRegionById: RegionsI = await RegionModel.findByIdAndUpdate(regionId, { regionData });
    if (!updateRegionById) throw new HttpException(409, "Region doesn't exist");

    return updateRegionById;
  }

  public async deleteRegion(regionId: string): Promise<RegionsI> {
    const deleteRegionById: RegionsI = await RegionModel.findByIdAndDelete(regionId);
    if (!deleteRegionById) throw new HttpException(409, "Region doesn't exist");

    return deleteRegionById;
  }

  public async bulkCheckAndCreateRegions(regionNames: string[]): Promise<{ existing: RegionsI[], created: RegionsI[] }> {
    // Convert all input names to lowercase
    const lowercaseNames = regionNames.map(name => name.toLowerCase());
    
    // Find existing regions (case-insensitive)
    const existingRegions = await RegionModel.find({ 
      name: { 
        $in: lowercaseNames.map(name => new RegExp(`^${name}$`, 'i'))
      } 
    });
    
    const existingNames = existingRegions.map(r => r.name.toLowerCase());
    
    // Find names that don't exist (case-insensitive)
    const newNames = regionNames.filter(name => 
      !existingNames.includes(name.toLowerCase())
    );
    
    // Create new regions
    const newRegions = await RegionModel.create(
      newNames.map(name => ({ name }))
    );

    return {
      existing: existingRegions,
      created: newRegions
    };
  }
}
