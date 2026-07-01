import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExerciseEntity } from "src/database/entities/exercise.entity";
import { ExercisesController } from "src/modules/exercises/exercises.controller";
import { ExercisesService } from "src/modules/exercises/exercises.service";

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseEntity])],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
