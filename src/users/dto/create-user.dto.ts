import { IsString, IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido.' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido.' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido.' })
  lastName: string;

  @IsString()
  @IsNotEmpty({ message: 'El rol es requerido.' })
  @IsEnum(['admin', 'secretary'], { message: 'El rol debe ser "admin" o "secretary".' })
  role: string;
}