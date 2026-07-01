import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExerciseEntity } from "src/database/entities/exercise.entity";
import { StudentTrainingEntity } from "src/database/entities/student-training.entity";
import { TrainingExerciseEntity } from "src/database/entities/training-exercise.entity";
import { TrainingEntity } from "src/database/entities/training.entity";
import { TrainingsController } from "src/modules/trainings/trainings.controller";
import { TrainingsService } from "src/modules/trainings/trainings.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingEntity,
      TrainingExerciseEntity,
      StudentTrainingEntity,
      ExerciseEntity,
    ]),
  ],
  controllers: [TrainingsController],
  providers: [TrainingsService],
  exports: [TrainingsService],
})
export class TrainingsModule {}
