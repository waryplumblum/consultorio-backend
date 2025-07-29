// src/appointments/dto/get-appointments.dto.ts
import {
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetAppointmentsDto {
  @IsOptional()
  @IsString()
  patientName?: string; // Filtrar por nombre de paciente (búsqueda parcial)

  @IsOptional()
  @IsString()
  patientEmail?: string; // Filtrar por email de paciente

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'confirmed', 'cancelled', 'completed']) // Solo estos estados son válidos
  status?: string; // Filtrar por estado de la cita

  @IsOptional()
  @Type(() => Date) // Importante para transformar el string de la URL a un objeto Date
  dateFrom?: Date; // Filtrar citas desde esta fecha (scheduledDateTime >= dateFrom)

  @IsOptional()
  @Type(() => Date)
  dateTo?: Date; // Filtrar citas hasta esta fecha (scheduledDateTime <= dateTo)

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number) // Transforma el string de la URL a número
  page: number = 1; // Página actual, por defecto 1

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100) // Limitar el tamaño de la página para evitar abusos
  @Type(() => Number)
  limit: number = 10; // Número de elementos por página, por defecto 10

  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt'; // Campo para ordenar, por defecto 'scheduledDateTime'

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc'; // Orden de clasificación, por defecto ascendente

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean) // Importante para transformar 'true'/'false' de la URL a booleano
  isDeleted?: boolean;
}
