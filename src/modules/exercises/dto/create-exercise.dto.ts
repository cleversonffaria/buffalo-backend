import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ArrayMinSize,
} from "class-validator";
import { ExerciseDifficulty } from "src/common/enums/exercise-difficulty.enum";

export class CreateExerciseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  muscle_groups: string[];

  @IsString()
  equipment: string;

  @IsEnum(ExerciseDifficulty)
  difficulty: ExerciseDifficulty;

  @IsOptional()
  @IsString()
  instructions?: string | null;

  @IsOptional()
  @IsString()
  image_url?: string | null;

  @IsOptional()
  @IsString()
  video_url?: string | null;

  @IsOptional()
  @IsString()
  created_by?: string | null;
}
