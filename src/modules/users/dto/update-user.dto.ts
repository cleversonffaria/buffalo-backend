import { PartialType } from "@nestjs/mapped-types";
import { IsOptional, IsString } from "class-validator";
import { CreateStudentDto } from "src/modules/students/dto/create-student.dto";

export class UpdateUserDto extends PartialType(CreateStudentDto) {
  @IsOptional()
  @IsString()
  start_date?: string;
}
