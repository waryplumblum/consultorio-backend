import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import {User  } from './entities/user.entity';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcrypt from 'bcryptjs';


@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User >) {}

  async create(createUserDto: CreateUserDto): Promise<User > {
    // 1. Verificar si el correo ya existe
    const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    // 2. Hashear la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10); // 10 es el costo del hash (rondas)

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword, // Reemplazamos la contraseña por la hasheada
    });
    return createdUser.save();
  }

  async findAll(): Promise<User []> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User > {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    return user;
  }

  // Nuevo método para encontrar usuario por email (necesario para el login)
  async findByEmail(email: string): Promise<User  | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User > {
    // Si la contraseña se va a actualizar, debe ser hasheada
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const existingUser = await this.userModel
      .findByIdAndUpdate(id, { $set: updateUserDto }, { new: true })
      .exec();

    if (!existingUser) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado para actualizar.`);
    }
    return existingUser;
  }

  async remove(id: string): Promise<any> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
        throw new NotFoundException(`Usuario con ID "${id}" no encontrado para eliminar.`);
    }
    return { message: `Usuario con ID "${id}" eliminado exitosamente.` };
  }
}