import { Model } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  async signupUser(createUserDto: CreateUserDto): Promise<User>{
    const saltOrRounds = 10;

    if (await this.UserModel.findOne({email: createUserDto.email})){
      throw new HttpException("Email already exists", HttpStatus.BAD_REQUEST)
    }

    if (await this.UserModel.findOne({username:createUserDto.username})){
      throw new HttpException("username Already exists", HttpStatus.BAD_REQUEST);
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltOrRounds);
    const createdUser = new this.UserModel({...createUserDto, password:hashedPassword});
    console.log("from users.service.ts");
    return createdUser.save();
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.UserModel.findOne({email}).exec();
    return user;
  }
 
  
  
  async findOneByUsername(username: string): Promise<User> {
    const user = await this.UserModel.findOne({username}).exec();
    return user;
  }

  async deleteUser(email: string): Promise<User | null> {
    const deletedUser = this.UserModel.findOneAndDelete({email});
    if (deletedUser){
      return deletedUser;
    }
    throw new HttpException("User Not Found", HttpStatus.NOT_FOUND);
  }


  async updateUsername(email: string, username: string): Promise<string> {
    const user = await this.UserModel.findByIdAndUpdate({email}, {username});
    return user.username;
  }

  async updatePassword(email: string, oldPassword: string, newPassword: string){
    const user = await this.UserModel.findOne({email}).exec();
   
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new HttpException("Wrong password", HttpStatus.BAD_REQUEST);
    }
    const salt = await bcrypt.genSalt();
   
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedNewPassword;
    await user.save();

    return {
      "meassage": "SUCCESS"
    };
}

}
