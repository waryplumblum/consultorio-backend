import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

import {
  Appointment,
  AppointmentDocument,
} from './entities/appointment.entity';
import { GetAppointmentsDto } from './dto/get-appointments.dto';

import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    private mailService: MailService,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentDocument> {
    console.log(
      'Service: Intentando crear nueva cita con DTO:',
      createAppointmentDto,
    );
    const createdAppointment = new this.appointmentModel(createAppointmentDto);
    try {
      const savedAppointment = await createdAppointment.save();
      console.log(
        'Service: Cita guardada en DB exitosamente, ID:',
        savedAppointment._id,
      );

      await this.mailService.sendAppointmentNotification(savedAppointment);

      return savedAppointment;
    } catch (error) {
      console.error('Service: Error al guardar la cita en DB:', error.message);
      throw error;
    }
  }

  async findAllPaginated(
    queryDto: GetAppointmentsDto,
  ): Promise<{ appointments: AppointmentDocument[]; total: number }> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      patientName,
      patientEmail,
      status,
      dateFrom,
      dateTo,
    } = queryDto;

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1; // { scheduledDateTime: 1 } o { scheduledDateTime: -1 }

    const filter: any = {}; // Objeto para construir los filtros de MongoDB

    if (patientName) {
      filter.patientName = { $regex: patientName, $options: 'i' }; // Búsqueda insensible a mayúsculas/minúsculas
    }
    if (patientEmail) {
      filter.patientEmail = { $regex: patientEmail, $options: 'i' };
    }
    if (status) {
      filter.status = status;
    }
    if (dateFrom || dateTo) {
      filter.scheduledDateTime = {};
      if (dateFrom) {
        filter.scheduledDateTime.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.scheduledDateTime.$lte = new Date(dateTo);
      }
    }

    const [appointments, total] = await Promise.all([
      this.appointmentModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.appointmentModel.countDocuments(filter).exec(),
    ]);

    return { appointments, total };
  }

  async findOne(id: string): Promise<AppointmentDocument> {
    const appointment = await this.appointmentModel.findById(id).exec();
    if (!appointment) {
      throw new NotFoundException(`Cita con ID "${id}" no encontrada.`);
    }
    return appointment;
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentDocument> {
    console.log(`Service: Intentando actualizar cita con ID: ${id}`);
    console.log('Service: Datos de actualización:', updateAppointmentDto);

    // Si tu DTO no tiene `updatedAt`, o si quieres asegurarte, puedes añadirlo aquí
    const dataToUpdate: any = {
      ...updateAppointmentDto,
      updatedAt: new Date(),
    };

    const existingAppointment = await this.appointmentModel
      .findByIdAndUpdate(id, { $set: dataToUpdate }, { new: true })
      .exec();

    if (!existingAppointment) {
      console.warn(
        `Service: Cita con ID "${id}" no encontrada durante la actualización.`,
      );
      throw new NotFoundException(
        `Cita con ID "${id}" no encontrada para actualizar.`,
      );
    }
    console.log(`Service: Cita con ID ${id} actualizada en DB.`);
    return existingAppointment;
  }

  async remove(id: string): Promise<any> {
    const result = await this.appointmentModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Cita con ID "${id}" no encontrada para eliminar.`,
      );
    }
    return { message: `Cita con ID "${id}" eliminada exitosamente.` };
  }

  async countAllAppointments(): Promise<number> {
    return this.appointmentModel.countDocuments().exec();
  }

  async findUpcomingAppointments(
    limit: number = 5,
  ): Promise<AppointmentDocument[]> {
    const now = new Date();
    return this.appointmentModel
      .find({
        scheduledDateTime: { $gte: now },
        status: { $in: ['pending', 'confirmed'] }, // Considera solo citas pendientes o confirmadas
      })
      .sort({ scheduledDateTime: 1 })
      .limit(limit) // Limita el número de resultados
      .exec();
  }

  async findFutureAppointmentsForPublic(): Promise<AppointmentDocument[]> {
    const now = new Date();
    return this.appointmentModel
      .find({
        scheduledDateTime: { $gte: now },
        status: { $in: ['pending', 'confirmed'] },
      })
      .sort({ scheduledDateTime: 1 })
      .exec();
  }
}
