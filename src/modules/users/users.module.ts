import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExerciseEntity } from "src/database/entities/exercise.entity";
import { StudentTrainingEntity } from "src/database/entities/student-training.entity";
import { TrainingLogEntity } from "src/database/entities/training-log.entity";
import { UserEntity } from "src/database/entities/user.entity";
import { StudentsModule } from "src/modules/students/students.module";
import { UsersController } from "src/modules/users/users.controller";
import { UsersService } from "src/modules/users/users.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ExerciseEntity,
      StudentTrainingEntity,
      TrainingLogEntity,
    ]),
    StudentsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
