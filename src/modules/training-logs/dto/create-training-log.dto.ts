import { IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTrainingLogDto {
  @IsString()
  studentTrainingId: string;

  @IsString()
  trainingExerciseId: string;

  @IsInt()
  setsCompleted: number;

  @IsOptional()
  @IsInt()
  repetitionsCompleted?: number;

  @IsOptional()
  weightUsed?: number;

  @IsOptional()
  @IsInt()
  durationSeconds?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class LogCompletedSetDto {
  @IsString()
  studentTrainingId: string;

  @IsString()
  exerciseId: string;

  @IsInt()
  setNumber: number;

  @IsInt()
  repsCompleted: number;

  @IsOptional()
  @IsNumber()
  weightUsed?: number;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsString()
  customDate?: string;
}
