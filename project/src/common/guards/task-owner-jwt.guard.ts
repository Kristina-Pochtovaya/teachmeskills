import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TaskOwnerJWT implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    const authHeader = req.headers['authorization'];
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new ForbiddenException('Invalid authorization format');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      console.log('Payload:', payload);
      this.jwtService.verify(token);
      return true;
    } catch (err) {
      throw new ForbiddenException('Invalid or expired token');
    }
  }
}
