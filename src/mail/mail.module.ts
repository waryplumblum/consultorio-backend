import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Para leer variables de entorno
import { MailService } from './mail.service';

@Module({
  imports: [
    ConfigModule, // Importa ConfigModule para usar ConfigService
    MailerModule.forRootAsync({
      imports: [ConfigModule], // Asegúrate de importar ConfigModule aquí también
      useFactory: async (configService: ConfigService) => ({
        // Configuración de transporte SMTP
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: configService.get<number>('MAIL_PORT'),
          secure: configService.get<boolean>('MAIL_SECURE'), // true for 465, false for other ports
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
          // Ignorar certificados SSL para desarrollo si es necesario (NO EN PRODUCCIÓN)
          // tls: {
          //   rejectUnauthorized: false,
          // },
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM'),
        },
        template: {
          dir: join(__dirname, 'templates'), // Ruta a tus plantillas de correo
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService], // Inyecta ConfigService en la factoría
    }),
  ],
  providers: [MailService],
  exports: [MailService], // Exporta MailService para que pueda ser usado en otros módulos
})
export class MailModule {}