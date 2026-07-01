import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { JwtUser } from "src/common/interfaces/jwt-user.interface";
import { ActivateAccountDto } from "src/modules/auth/dto/activate-account.dto";
import { LoginDto } from "src/modules/auth/dto/login.dto";
import { RefreshTokenDto } from "src/modules/auth/dto/refresh-token.dto";
import { RegisterDto } from "src/modules/auth/dto/register.dto";
import { ResetPasswordDto } from "src/modules/auth/dto/reset-password.dto";
import { SendResetCodeDto } from "src/modules/auth/dto/send-reset-code.dto";
import { VerifyCodeDto } from "src/modules/auth/dto/verify-code.dto";
import { AuthService } from "src/modules/auth/auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("refresh")
  @Public()
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post("logout")
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto);
  }

  @Get("me")
  me(@CurrentUser() user: JwtUser) {
    return this.authService.me(user.sub);
  }

  @Public()
  @Get("first-access/:email")
  lookupFirstAccess(@Param("email") email: string) {
    return this.authService.lookupFirstAccess(email);
  }

  @Public()
  @Post("activation/verify")
  verifyActivationCode(@Body() dto: VerifyCodeDto) {
    return this.authService.verifyActivationCode(dto);
  }

  @Public()
  @Post("activation/activate")
  activateAccount(@Body() dto: ActivateAccountDto) {
    return this.authService.activateAccount(dto);
  }

  @Public()
  @Post("activation/resend")
  resendActivationCode(@Body() dto: SendResetCodeDto) {
    return this.authService.resendActivationCode(dto.email);
  }

  @Public()
  @Post("password/send-code")
  sendResetCode(@Body() dto: SendResetCodeDto) {
    return this.authService.sendResetCode(dto);
  }

  @Public()
  @Post("password/verify-code")
  verifyResetCode(@Body() dto: VerifyCodeDto) {
    return this.authService.verifyResetCode(dto);
  }

  @Public()
  @Post("password/reset")
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
