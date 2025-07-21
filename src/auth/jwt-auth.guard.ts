import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const handler = context.getHandler();
    const classRef = context.getClass();
    const request = context.switchToHttp().getRequest();

    console.log(`--- Depuración de Guard ---`);
    console.log(`Ruta: ${request.method} ${request.url}`);
    console.log(`Handler: ${handler.name}`);
    console.log(`Clase del Controlador: ${classRef.name}`);

    // *** Líneas de depuración para ver los metadatos ***
    const handlerMetadata = this.reflector.get(IS_PUBLIC_KEY, handler);
    const classMetadata = this.reflector.get(IS_PUBLIC_KEY, classRef);
    console.log(`Metadato Public en el handler (${handler.name}):`, handlerMetadata);
    console.log(`Metadato Public en la clase (${classRef.name}):`, classMetadata);

    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [handler, classRef],
    );

    console.log(`Resultado final de isPublic:`, isPublic);

    if (isPublic) {
      console.log('JWT Auth Guard: Ruta marcada como pública. Saltando autenticación.');
      console.log(`--- Fin Depuración ---`);
      return true;
    }
    console.log('JWT Auth Guard: Ruta NO marcada como pública. Aplicando autenticación.');
    console.log(`--- Fin Depuración ---`);
    return super.canActivate(context);
  }
}