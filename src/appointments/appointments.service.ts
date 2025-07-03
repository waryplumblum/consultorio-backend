import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

import { Appointment, AppointmentDocument } from './entities/appointment.entity';

@Injectable()
export class AppointmentsService {

  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
  ) { }

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const createdAppointment = new this.appointmentModel(createAppointmentDto);
    return createdAppointment.save();
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentModel.find().exec();
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentModel.findById(id).exec();
    if (!appointment) {
      throw new NotFoundException(`Cita con ID "${id}" no encontrada.`);
    }
    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const existingAppointment = await this.appointmentModel
      .findByIdAndUpdate(id, { $set: updateAppointmentDto }, { new: true })
      .exec();

    if (!existingAppointment) {
      throw new NotFoundException(`Cita con ID "${id}" no encontrada para actualizar.`);
    }
    return existingAppointment;
  }

  async remove(id: string): Promise<any> { // Puede devolver un objeto con `{ deletedCount: 1 }`
    const result = await this.appointmentModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Cita con ID "${id}" no encontrada para eliminar.`);
    }
    return { message: `Cita con ID "${id}" eliminada exitosamente.` };
  }
}