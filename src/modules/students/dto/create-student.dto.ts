import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { GenderType } from "src/common/enums/gender-type.enum";

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsInt()
  @Min(1)
  age: number;

  @IsEnum(GenderType)
  gender: GenderType;

  @IsString()
  goal: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;
}
