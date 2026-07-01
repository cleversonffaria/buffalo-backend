import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRole } from "src/common/enums/user-role.enum";
import { CreateExerciseDto } from "src/modules/exercises/dto/create-exercise.dto";
import { UpdateExerciseDto } from "src/modules/exercises/dto/update-exercise.dto";
import { ExercisesService } from "src/modules/exercises/exercises.service";

@Controller("exercises")
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  @Roles(UserRole.TEACHER)
  createExercise(@Body() dto: CreateExerciseDto) {
    return this.exercisesService.createExercise(dto);
  }

  @Get()
  getExercises(
    @Query("muscleGroups") muscleGroups?: string,
    @Query("difficulty") difficulty?: string,
    @Query("equipment") equipment?: string,
    @Query("search") search?: string
  ) {
    return this.exercisesService.getExercises({
      muscleGroups: muscleGroups ? muscleGroups.split(",") : undefined,
      difficulty,
      equipment,
      search,
    });
  }

  @Get("meta/muscle-groups")
  getAvailableMuscleGroups() {
    return this.exercisesService.getAvailableMuscleGroups();
  }

  @Get("meta/equipments")
  getAvailableEquipments() {
    return this.exercisesService.getAvailableEquipments();
  }

  @Get(":id")
  getExerciseById(@Param("id") id: string) {
    return this.exercisesService.getExerciseById(id);
  }

  @Patch(":id")
  @Roles(UserRole.TEACHER)
  updateExercise(@Param("id") id: string, @Body() dto: UpdateExerciseDto) {
    return this.exercisesService.updateExercise(id, dto);
  }

  @Delete(":id")
  @Roles(UserRole.TEACHER)
  deleteExercise(@Param("id") id: string) {
    return this.exercisesService.deleteExercise(id);
  }
}
