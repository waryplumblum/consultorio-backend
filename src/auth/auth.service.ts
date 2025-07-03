import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service'; // Necesitamos el servicio de usuarios
import { JwtService } from '@nestjs/jwt'; // Necesitamos el servicio JWT para firmar tokens
import * as bcrypt from 'bcryptjs'; // Para comparar contraseñas hasheadas
import { User  } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService, // Inyecta JwtService
    ) { }

    async validateUser(email: string, pass: string): Promise<Omit<User , 'password'> | null> {
        const user = await this.usersService.findByEmail(email);

        if (!user || !user.isActive) { // Manejo temprano si el usuario no existe o no está activo
            return null;
        }

        const isPasswordValid = await bcrypt.compare(pass, user.password);
        if (!isPasswordValid) {
            return null; // Contraseña inválida
        }


        const userObject = user.toObject(); // Obtiene una copia JS plana del documento Mongoose
        const { password, ...result } = userObject; // Ahora 'result' tendrá _id

        return result as Omit<User , 'password'>; // Aseguramos el tipo de retorno
    }

    // El parámetro 'user' aquí debe ser del tipo que devuelve 'validateUser'
    async login(user: Omit<User , 'password'>) {

        const payload = {
            email: user.email,
            sub: user._id.toString(), // Accede a _id directamente y conviértelo a string
            role: user.role,
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}