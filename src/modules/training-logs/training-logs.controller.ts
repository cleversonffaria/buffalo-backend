import { Body, Controller, Get, Logger, Param, Post, Query } from "@nestjs/common";
import {
  CreateTrainingLogDto,
  LogCompletedSetDto,
} from "src/modules/training-logs/dto/create-training-log.dto";
import { TrainingLogsService } from "src/modules/training-logs/training-logs.service";

@Controller("training-logs")
export class TrainingLogsController {
  private readonly logger = new Logger(TrainingLogsController.name);

  constructor(private readonly trainingLogsService: TrainingLogsService) {}

  @Post()
  createLog(@Body() dto: CreateTrainingLogDto) {
    return this.trainingLogsService.createLog(dto);
  }

  @Get("student-training/:studentTrainingId")
  getLogsByTraining(
    @Param("studentTrainingId") studentTrainingId: string,
    @Query("date") date?: string
  ) {
    return this.trainingLogsService.getLogsByTraining(studentTrainingId, date);
  }

  @Post("completed-set")
  logCompletedSet(@Body() dto: LogCompletedSetDto) {
    this.logger.log(
      `POST /training-logs/completed-set studentTrainingId=${dto.studentTrainingId} exerciseId=${dto.exerciseId} setNumber=${dto.setNumber} repsCompleted=${dto.repsCompleted ?? "null"} weightUsed=${dto.weightUsed ?? "null"} duration=${dto.duration ?? "null"} customDate=${dto.customDate ?? "null"}`
    );

    return this.trainingLogsService.logCompletedSet(dto);
  }

  @Get("progress/:studentId/:exerciseId")
  getProgressData(
    @Param("studentId") studentId: string,
    @Param("exerciseId") exerciseId: string,
    @Query("days") days?: string
  ) {
    return this.trainingLogsService.getProgressData(
      studentId,
      exerciseId,
      days ? Number(days) : 30
    );
  }

  @Get("summary/:studentTrainingId")
  getWorkoutSummary(
    @Param("studentTrainingId") studentTrainingId: string,
    @Query("date") date: string
  ) {
    return this.trainingLogsService.getWorkoutSummary(studentTrainingId, date);
  }
}
