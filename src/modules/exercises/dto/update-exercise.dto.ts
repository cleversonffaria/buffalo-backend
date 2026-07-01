import { PartialType } from "@nestjs/mapped-types";
import { CreateExerciseDto } from "src/modules/exercises/dto/create-exercise.dto";

export class UpdateExerciseDto extends PartialType(CreateExerciseDto) {}
