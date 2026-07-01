import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";

class CreateTrainingExerciseDto {
  @IsString()
  exerciseId: string;

  @IsInt()
  sets: number;

  @IsOptional()
  @IsInt()
  repetitions?: number;

  @IsOptional()
  @Type(() => Number)
  load?: number;

  @IsOptional()
  @IsInt()
  restSeconds?: number;

  @IsInt()
  orderIndex: number;
}

export class CreateTrainingDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  teacherId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTrainingExerciseDto)
  exercises: CreateTrainingExerciseDto[];
}

export class UpdateTrainingDto extends PartialType(CreateTrainingDto) {}

export class AssignTrainingDto {
  @IsString()
  studentId: string;

  @IsString()
  trainingId: string;

  @IsArray()
  @IsInt({ each: true })
  weekDays: number[];

  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class UpdateStudentTrainingDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  week_days?: string[];

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string | null;

  @IsOptional()
  is_active?: boolean;
}
