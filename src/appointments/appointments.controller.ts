import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { GetAppointmentsDto } from './dto/get-appointments.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @Post()
  async create(@Body() createAppointmentDto: CreateAppointmentDto) {
    console.log('Controller: Recibida solicitud para crear una cita.');
    console.log('Controller: DTO recibido:', createAppointmentDto)
    try {
      const result = await this.appointmentsService.create(createAppointmentDto);
      console.log('Controller: Cita creada exitosamente, ID:', result._id);
      return result;
    } catch (error) {
      console.error('Controller: Error al crear la cita:', error.message);
      throw error; // Re-lanza el error para que NestJS lo maneje
    }
  }

  @Get('summary') // <--- NUEVO ENDPOINT PARA EL RESUMEN DEL DASHBOARD
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'secretary')
  async getSummary() {
    const totalAppointments = await this.appointmentsService.countAllAppointments();
    const upcomingAppointments = await this.appointmentsService.findUpcomingAppointments(5); // Las próximas 5 citas
    return {
      totalAppointments,
      upcomingAppointments,
    };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'secretary')
  async findAll(@Query() query: GetAppointmentsDto) {
    const { appointments, total } = await this.appointmentsService.findAllPaginated(query); // <--- Llama al nuevo método del servicio
    return {
      data: appointments,
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Protege solo esta ruta GET /appointments/:id
  @Roles('admin', 'secretary')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Protege solo esta ruta PATCH /appointments/:id
  @Roles('admin', 'secretary')
  async update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) { // Añadimos async
    console.log(`Controller: Recibida solicitud para actualizar cita con ID: ${id}`);
    console.log('Controller: DTO de actualización recibido:', updateAppointmentDto);
    try {
      const result = await this.appointmentsService.update(id, updateAppointmentDto);
      console.log(`Controller: Cita con ID ${id} actualizada exitosamente.`);
      return result;
    } catch (error) {
      console.error(`Controller: Error al actualizar cita con ID ${id}:`, error.message);
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Protege solo esta ruta DELETE /appointments/:id
  @Roles('admin', 'secretary')
  async remove(@Param('id') id: string) { // Añadimos async
    console.log(`Controller: Recibida solicitud para eliminar cita con ID: ${id}`);
    try {
      const result = await this.appointmentsService.remove(id);
      console.log(`Controller: Cita con ID ${id} eliminada exitosamente.`);
      return result;
    } catch (error) {
      console.error(`Controller: Error al eliminar cita con ID ${id}:`, error.message);
      throw error;
    }
  }
}