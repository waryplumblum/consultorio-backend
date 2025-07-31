import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface User extends Document { // <--- User ahora extiende Document
  _id: Types.ObjectId; // El id de MongoDB, de tipo ObjectId
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'secretary'; // Usa tipos literales para los roles
  //isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Schema()
export class User {

  _id: Types.ObjectId; 
  
  @Prop({ required: true, unique: true })
  email: string; // El correo será el identificador único para el login

  @Prop({ required: true })
  password: string; // La contraseña hasheada

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, enum: ['admin', 'secretary'], default: 'secretary' })
  role: 'admin' | 'secretary';

  // @Prop({ default: true }) // <-- ELIMINAMOS O MARCADO PARA ELIMINAR
  // isActive: boolean;

  @Prop({ default: false }) // <-- NUEVO: Por defecto, no está eliminado
  isDeleted: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', function (next) {
  if (this.isNew || this.isModified()) {
    this.updatedAt = new Date();
  }
  next();
});

UserSchema.pre(['findOneAndUpdate', 'updateOne'], function (next) {
  this.set({ updatedAt: new Date() });
  next();
});
