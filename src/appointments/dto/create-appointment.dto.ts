import { IsString, IsPhoneNumber, IsEmail, IsNotEmpty, IsOptional, IsDate, Matches, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum AppointmentStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
}

export class CreateAppointmentDto {
    @IsString()
    @IsNotEmpty()
    patientName: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{10}$/, { message: 'El número de teléfono debe ser una cadena de 10 dígitos numéricos.' })
    patientPhone: string;

    @IsEmail()
    @IsNotEmpty()
    patientEmail?: string;

    @IsString()
    @IsNotEmpty()
    reason: string;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    preferredDateTime: Date;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    scheduledDateTime: Date;

    @IsEnum(AppointmentStatus) // Valida que el estado sea uno de los valores definidos en el enum
    @IsNotEmpty() // Si siempre se envía
    @IsOptional() // Si en la creación inicial no se envía siempre (ej. por defecto es 'pending')
    status: AppointmentStatus; // O 'pending' | 'confirmed' | 'cancelled' | 'completed'; si prefieres tipo literal
}