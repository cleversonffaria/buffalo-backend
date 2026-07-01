import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { UserRole } from "src/common/enums/user-role.enum";

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
