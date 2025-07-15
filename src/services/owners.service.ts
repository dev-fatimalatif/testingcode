import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { OwnersI } from '@interfaces/owners.interface';
import { OwnerModel } from '@models/owners.model';

@Service()
export class OwnerService {
  public async findAllOwner(): Promise<OwnersI[]> {
    const Owners: OwnersI[] = await OwnerModel.find();
    return Owners;
  }

  public async findOwnerById(OwnerId: string): Promise<OwnersI> {
    const findOwner: OwnersI = await OwnerModel.findOne({ _id: OwnerId });
    if (!findOwner) throw new HttpException(409, "Owner doesn't exist");

    return findOwner;
  }

  public async createOwner(OwnerData: OwnersI): Promise<OwnersI> {
    const createOwnerData: OwnersI = await OwnerModel.create(OwnerData);
    return createOwnerData;
  }

  public async updateOwner(OwnerId: string, OwnerData: OwnersI): Promise<OwnersI> {
    const updateOwnerById: OwnersI = await OwnerModel.findByIdAndUpdate(OwnerId, { OwnerData });
    if (!updateOwnerById) throw new HttpException(409, "Owner doesn't exist");

    return updateOwnerById;
  }

  public async deleteOwner(OwnerId: string): Promise<OwnersI> {
    const deleteOwnerById: OwnersI = await OwnerModel.findByIdAndDelete(OwnerId);
    if (!deleteOwnerById) throw new HttpException(409, "Owner doesn't exist");

    return deleteOwnerById;
  }
}
