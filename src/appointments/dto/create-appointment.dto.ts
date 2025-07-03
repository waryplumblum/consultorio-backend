import { IsString, IsPhoneNumber, IsEmail, IsNotEmpty, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
    @IsString()
    @IsNotEmpty()
    patientName: string;

    @IsPhoneNumber('MX')
    @IsNotEmpty()
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

}