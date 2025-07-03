import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport'; // Importa AuthGuard
import { CreateUserDto } from '../users/dto/create-user.dto'; // Si queremos un endpoint de registro público
import { UsersService } from '../users/users.service'; // Si queremos un endpoint de registro público
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService, // Opcional: si quieres un endpoint para crear usuarios
  ) {}

  @Post('register') // Opcional: endpoint para crear nuevos usuarios
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @HttpCode(HttpStatus.OK) // Asegura que la respuesta sea 200 OK
  @Post('login')
  async login(@Body() loginDto: LoginDto) { // Usa el DTO para el login
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }
    return this.authService.login(user);
  }

  // Ejemplo de ruta protegida para probar el JWT
  @UseGuards(AuthGuard('jwt')) // Protege esta ruta con la estrategia 'jwt'
  @Get('profile')
  getProfile(@Request() req) {
    return req.user; // `req.user` contiene la información del payload del JWT que retornó JwtStrategy
  }
}