import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      isDeleted: false,
    });
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({ isDeleted: false }).exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user || user.isDeleted) {
      throw new NotFoundException(
        `Usuario con ID "${id}" no encontrado o está eliminado.`,
      );
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email, isDeleted: false }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const dataToUpdate: any = {
      ...updateUserDto,
      updatedAt: new Date(),
    };

    const existingUser = await this.userModel
      .findByIdAndUpdate(id, { $set: dataToUpdate }, { new: true })
      .exec();

    if (!existingUser) {
      throw new NotFoundException(
        `Usuario con ID "${id}" no encontrado para actualizar.`,
      );
    }

    return existingUser;
  }

  async remove(id: string): Promise<any> {
    const result = await this.userModel
      .findByIdAndUpdate(
        id,
        { $set: { isDeleted: true, updatedAt: new Date() } },
        { new: true },
      )
      .exec();

    if (!result) {
      throw new NotFoundException(
        `Usuario con ID "${id}" no encontrado para eliminar lógicamente.`,
      );
    }
    return {
      message: `Usuario con ID "${id}" marcado como eliminado exitosamente.`,
      user: result,
    };
  }
}
