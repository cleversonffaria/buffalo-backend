import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PasswordResetCodeEntity } from "src/database/entities/password-reset-code.entity";
import { RefreshTokenEntity } from "src/database/entities/refresh-token.entity";
import { UserEntity } from "src/database/entities/user.entity";
import { MailModule } from "src/modules/mail/mail.module";
import { AuthController } from "src/modules/auth/auth.controller";
import { AuthService } from "src/modules/auth/auth.service";

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      UserEntity,
      PasswordResetCodeEntity,
      RefreshTokenEntity,
    ]),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
