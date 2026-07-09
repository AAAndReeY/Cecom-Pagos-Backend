import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    
    // Si usáramos bcrypt: const isMatch = await bcrypt.compare(pass, user.password);
    // Para simplificar localmente la prueba, comparación directa:
    if (user?.password !== pass) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    
    if (!user.activo) {
      throw new UnauthorizedException('Su cuenta ha sido deshabilitada');
    }
    
    const payload = { sub: user.id, username: user.username, rol: user.rol };
    return {
      access_token: await this.jwtService.signAsync(payload),
      rol: user.rol,
      username: user.username
    };
  }
}
