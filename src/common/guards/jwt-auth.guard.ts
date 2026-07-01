import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import configuration from "src/config/configuration";
import { IS_PUBLIC_KEY } from "src/common/decorators/public.decorator";
import { JwtUser } from "src/common/interfaces/jwt-user.interface";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token não informado");
    }

    const token = authorization.replace("Bearer ", "");

    try {
      const payload = this.jwtService.verify<JwtUser>(token, {
        secret: configuration().jwt.accessSecret,
      });
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException("Token inválido ou expirado");
    }
  }
}
