import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import configuration from "src/config/configuration";
import { ExerciseEntity } from "src/database/entities/exercise.entity";
import { PasswordResetCodeEntity } from "src/database/entities/password-reset-code.entity";
import { RefreshTokenEntity } from "src/database/entities/refresh-token.entity";
import { StudentTrainingEntity } from "src/database/entities/student-training.entity";
import { TrainingExerciseEntity } from "src/database/entities/training-exercise.entity";
import { TrainingLogEntity } from "src/database/entities/training-log.entity";
import { TrainingEntity } from "src/database/entities/training.entity";
import { UserEntity } from "src/database/entities/user.entity";

export const getTypeOrmConfig = (): TypeOrmModuleOptions => {
  const config = configuration();

  return {
    type: "postgres",
    url: config.databaseUrl,
    autoLoadEntities: false,
    entities: [
      UserEntity,
      ExerciseEntity,
      TrainingEntity,
      TrainingExerciseEntity,
      StudentTrainingEntity,
      TrainingLogEntity,
      PasswordResetCodeEntity,
      RefreshTokenEntity,
    ],
    synchronize: config.enableTypeormSync,
  };
};
