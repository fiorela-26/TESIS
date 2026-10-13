import 'dotenv/config';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const recibida = Buffer.from(String(req.headers['x-api-key'] ?? ''));
    const esperada = Buffer.from(process.env.IA_API_KEY ?? '');

    if (
      esperada.length === 0 ||
      recibida.length !== esperada.length ||
      !timingSafeEqual(recibida, esperada)
    ) {
      throw new UnauthorizedException('API key inválida');
    }
    return true;
  }
}