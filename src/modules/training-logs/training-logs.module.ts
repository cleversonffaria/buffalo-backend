import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StudentTrainingEntity } from "src/database/entities/student-training.entity";
import { TrainingExerciseEntity } from "src/database/entities/training-exercise.entity";
import { TrainingLogEntity } from "src/database/entities/training-log.entity";
import { TrainingLogsController } from "src/modules/training-logs/training-logs.controller";
import { TrainingLogsService } from "src/modules/training-logs/training-logs.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingLogEntity,
      TrainingExerciseEntity,
      StudentTrainingEntity,
    ]),
  ],
  controllers: [TrainingLogsController],
  providers: [TrainingLogsService],
  exports: [TrainingLogsService],
})
export class TrainingLogsModule {}
