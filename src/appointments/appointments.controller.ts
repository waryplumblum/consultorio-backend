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
  // ESTA RUTA NO LLEVA GUARDS SI ES PARA EL FORMULARIO PÚBLICO DEL PACIENTE
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
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
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Protege solo esta ruta DELETE /appointments/:id
  @Roles('admin', 'secretary')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
