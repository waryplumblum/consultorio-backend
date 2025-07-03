import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @Post()
  // ESTA RUTA NO LLEVA GUARDS SI ES PARA EL FORMULARIO PÚBLICO DEL PACIENTE
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Protege SOLO esta ruta GET /appointments
  @Roles('admin', 'secretary') // Solo admin o secretary pueden listar citas
  findAll() {
    return this.appointmentsService.findAll();
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
