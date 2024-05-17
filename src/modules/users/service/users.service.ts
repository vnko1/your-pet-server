import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User } from '../schema/users.schema';
import { CreateUserDto } from '../dto/users.dto';
import { AppService } from 'src/services';

@Injectable()
export class UsersService extends AppService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    super();
  }

  createUser(newUser: CreateUserDto) {
    return this.userModel.create(newUser);
  }

  findUser(query: { [key: string]: string }): Promise<User | null> {
    return this.userModel.findOne(query).exec();
  }
}
