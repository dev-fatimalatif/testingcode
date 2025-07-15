/* eslint-disable prettier/prettier */
import { hash, compare } from 'bcrypt';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/HttpException';
import { User, UserResponse } from '@interfaces/users.interface';
import { UserModel, UserSchemaTypo } from '@models/users.model';
import HttpStatus from '@/constants/HttpStatus';





@Service()
export class AuthService {
  public async signup(userData: User): Promise<UserResponse> {
    const findUser: User = await UserModel.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: UserResponse = (await UserModel.create({ ...userData, password: hashedPassword })).toJSON();

    return createUserData;
  }

  public async login(userData: User): Promise<UserResponse> {
    const findUser: UserSchemaTypo = await UserModel.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(HttpStatus.UNAUTHORIZED, `Invalid Credentials`);

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(HttpStatus.UNAUTHORIZED, `Invalid Credentials`);
    // const tokenData = createToken(findUser);
    // const cookie = createCookie(tokenData);
    return (findUser.toJSON()) as any;
  }

  public async logout(cognitoUserId: string): Promise<User> {
    const findUser: User = await UserModel.findOne({ cognitoUserId });
    if (!findUser) throw new HttpException(409, `This user was not found`);

    return findUser;
  }
}
