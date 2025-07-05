import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

import { Appointment, AppointmentDocument } from './entities/appointment.entity';
import { GetAppointmentsDto } from './dto/get-appointments.dto';

@Injectable()
export class AppointmentsService {

  constructor(
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
  ) { }

  async create(createAppointmentDto: CreateAppointmentDto): Promise<AppointmentDocument> {
    const createdAppointment = new this.appointmentModel(createAppointmentDto);
    return createdAppointment.save();
  }

  /*async findAll(): Promise<Appointment[]> {
    return this.appointmentModel.find().exec();
  }*/

  async findAllPaginated(queryDto: GetAppointmentsDto): Promise<{ appointments: AppointmentDocument[], total: number }> {
    const { page, limit, sortBy, sortOrder, patientName, patientEmail, status, dateFrom, dateTo } = queryDto;

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
        filter.scheduledDateTime.$gte = dateFrom;
      }
      if (dateTo) {
        // Para incluir todo el día de `dateTo`, sumamos un día y buscamos menor que
        const endOfDay = new Date(dateTo);
        endOfDay.setDate(endOfDay.getDate() + 1);
        filter.scheduledDateTime.$lt = endOfDay;
      }
    }

    const [appointments, total] = await Promise.all([
      this.appointmentModel.find(filter)
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

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<AppointmentDocument> {
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

  async countAllAppointments(): Promise<number> {
    return this.appointmentModel.countDocuments().exec();
  }

  async findUpcomingAppointments(limit: number = 5): Promise<AppointmentDocument[]> {
    const now = new Date();
    return this.appointmentModel
      .find({
        scheduledDateTime: { $gte: now },
        status: { $in: ['pending', 'confirmed'] } // Considera solo citas pendientes o confirmadas
      })
      .sort({ scheduledDateTime: 1 })
      .limit(limit) // Limita el número de resultados
      .exec();
  }

}