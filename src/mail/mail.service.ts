import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { AppointmentDocument } from '../appointments/entities/appointment.entity';
import { ConfigService } from '@nestjs/config'; // Para leer la dirección de correo del doctor

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService, // Inyecta ConfigService
  ) {}

  async sendAppointmentNotification(appointment: AppointmentDocument): Promise<void> {
    const doctorEmail = this.configService.get<string>('DOCTOR_EMAIL'); // Obtener el correo del doctor de las variables de entorno

    if (!doctorEmail) {
      this.logger.error('No se ha configurado la dirección de correo del doctor (DOCTOR_EMAIL). No se enviará la notificación.');
      return;
    }

    // Formatear fecha y hora para el correo
    const preferredDate = new Date(appointment.preferredDateTime).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const preferredTime = new Date(appointment.preferredDateTime).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Formato 24 horas
    });

    try {
      await this.mailerService.sendMail({
        to: doctorEmail, // Dirección de correo del doctor
        subject: '¡Nueva Cita Agendada en tu Consultorio!', // Asunto del correo
        template: './new-appointment', // Nombre del archivo de plantilla (sin .hbs)
        context: { // Variables que se pasarán a la plantilla
          patientName: appointment.patientName,
          patientPhone: appointment.patientPhone,
          patientEmail: appointment.patientEmail,
          reason: appointment.reason,
          preferredDate: preferredDate,
          preferredTime: preferredTime,
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Notificación de cita enviada a ${doctorEmail} para ${appointment.patientName}`);
    } catch (error) {
      this.logger.error(`Error al enviar notificación de cita a ${doctorEmail}:`, error.message);
    }
  }
}