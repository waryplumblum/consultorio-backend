import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core'; // Importa Reflector para leer metadatos
import { ROLES_KEY } from './roles.decorator'; // Importa la clave de los roles

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {} // Inyecta Reflector

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener los roles requeridos para la ruta
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(), // Intenta leer de la función del controlador (método)
      context.getClass(),   // Intenta leer de la clase del controlador
    ]);

    // Si no se especifican roles para la ruta, permite el acceso (o deniega, según tu política por defecto)
    if (!requiredRoles) {
      return true; // Por defecto, si no hay roles especificados, cualquier usuario autenticado puede acceder.
                   // Si prefieres que TODAS las rutas protegidas requieran un rol específico, devuelve 'false' aquí.
    }

    // 2. Obtener el usuario autenticado desde el request
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      // Esto no debería suceder si AuthGuard se ejecuta primero, pero es una buena verificación.
      return false; // No hay usuario autenticado
    }

    // 3. Verificar si el rol del usuario está en los roles requeridos
    return requiredRoles.some((role) => user.role?.includes(role));
    // user.role es una cadena simple (ej. 'admin' o 'secretary'), por lo que user.role === role es más directo:
    // return requiredRoles.some((role) => user.role === role);
    // Si user.role pudiera ser un array de roles, entonces user.role.includes(role) sería correcto.
    // Basado en tu User entity, user.role es una sola cadena.
  }
}