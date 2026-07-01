import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Delete } from "@nestjs/common";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRole } from "src/common/enums/user-role.enum";
import {
  AssignTrainingDto,
  CreateTrainingDto,
  UpdateTrainingDto,
  UpdateStudentTrainingDto,
} from "src/modules/trainings/dto/create-training.dto";
import { TrainingsService } from "src/modules/trainings/trainings.service";

@Controller()
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Post("trainings")
  @Roles(UserRole.TEACHER)
  createTraining(@Body() dto: CreateTrainingDto) {
    return this.trainingsService.createTraining(dto);
  }

  @Get("trainings/teacher/:teacherId")
  @Roles(UserRole.TEACHER)
  getTrainingsByTeacher(@Param("teacherId") teacherId: string) {
    return this.trainingsService.getTrainingsByTeacher(teacherId);
  }

  @Get("trainings/:id")
  getTrainingWithExercises(@Param("id") id: string) {
    return this.trainingsService.getTrainingWithExercises(id);
  }

  @Patch("trainings/:id")
  @Roles(UserRole.TEACHER)
  updateTraining(@Param("id") id: string, @Body() dto: UpdateTrainingDto) {
    return this.trainingsService.updateTraining(id, dto);
  }

  @Delete("trainings/:id")
  @Roles(UserRole.TEACHER)
  deleteTraining(@Param("id") id: string) {
    return this.trainingsService.deleteTraining(id);
  }

  @Post("student-trainings")
  @Roles(UserRole.TEACHER)
  assignTrainingToStudent(@Body() dto: AssignTrainingDto) {
    return this.trainingsService.assignTrainingToStudent(dto);
  }

  @Get("student-trainings/student/:studentId")
  getStudentTrainings(
    @Param("studentId") studentId: string,
    @Query("activeOnly") activeOnly?: string
  ) {
    return this.trainingsService.getStudentTrainings(studentId, activeOnly !== "false");
  }

  @Patch("student-trainings/:id")
  updateStudentTraining(@Param("id") id: string, @Body() dto: UpdateStudentTrainingDto) {
    return this.trainingsService.updateStudentTraining(id, dto);
  }

  @Patch("student-trainings/:id/deactivate")
  deactivateStudentTraining(@Param("id") id: string) {
    return this.trainingsService.deactivateStudentTraining(id);
  }
}
