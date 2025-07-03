import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport'; // Importa PassportModule
import { JwtModule } from '@nestjs/jwt';       // Importa JwtModule
import { UsersModule } from '../users/users.module'; // Importa UsersModule
import { ConfigModule, ConfigService } from '@nestjs/config'; // Para manejar variables de entorno (JWT Secret)
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule, // Para cargar variables de entorno
    UsersModule, // Necesitamos acceso a User Service para validar credenciales
    PassportModule.register({ defaultStrategy: 'jwt' }), // Configura Passport para usar JWT por defecto
    JwtModule.registerAsync({ // Configura JWT de forma asíncrona para usar ConfigService
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // <--- Obtén el secreto de las variables de entorno
        signOptions: { expiresIn: '1h' }, // El token expira en 1 hora
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Añade JwtStrategy aquí
  exports: [AuthService, JwtModule, PassportModule], // Exporta para que otros módulos puedan usar JWT y Passport
})
export class AuthModule {}
