import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema()
export class Appointment {
  @Prop({ required: true })
  patientName: string;

  @Prop({ required: true })
  patientPhone: string;

  @Prop()
  patientEmail?: string; // Opcional

  @Prop({ required: true })
  reason: string;

  @Prop({ required: true, type: Date })
  preferredDateTime: Date;

  @Prop({ required: true, type: Date })
  scheduledDateTime: Date; // La fecha y hora final de la cita

  @Prop({ default: 'pending', enum: ['pending', 'confirmed', 'cancelled', 'attended', 'rescheduled'] })
  status: string;

  @Prop()
  notes?: string; // Notas internas para la secretaria/admin

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// Opcional: Hooks de Mongoose para actualizar `updatedAt` automáticamente
AppointmentSchema.pre('save', function (next) {
  if (this.isModified()) { // Solo actualiza si el documento ha sido modificado
    this.updatedAt = new Date();
  }
  next();
});