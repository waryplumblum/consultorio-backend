import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { Type } from 'class-transformer';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsOptional() // Indicar que es opcional para no requerirlo en cada actualización
  @IsBoolean() // Asegurar que sea un booleano
  @Type(() => Boolean) // Transformar el valor a booleano si viene como string
  isDeleted?: boolean;
}
