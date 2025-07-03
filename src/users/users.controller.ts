import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/auth/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';

// Protege todas las rutas de este controlador.
// Solo los administradores pueden gestionar usuarios.
@UseGuards(AuthGuard('jwt'), RolesGuard) // AuthGuard primero, luego RolesGuard
@Roles('admin') // Solo 'admin' puede acceder a este controlador
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  // Si queremos que los administradores puedan crear otros usuarios (secretarias/admins)
  // sin necesidad de un endpoint de registro público separado, lo protegemos aquí.
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Devolver 204 No Content para eliminación exitosa
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
