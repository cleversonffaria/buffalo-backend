import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { ServeStaticModule } from "@nestjs/serve-static";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import configuration from "src/config/configuration";
import { getTypeOrmConfig } from "src/database/typeorm.config";
import { AuthModule } from "src/modules/auth/auth.module";
import { ExercisesModule } from "src/modules/exercises/exercises.module";
import { MailModule } from "src/modules/mail/mail.module";
import { StorageModule } from "src/modules/storage/storage.module";
import { StudentsModule } from "src/modules/students/students.module";
import { TrainingLogsModule } from "src/modules/training-logs/training-logs.module";
import { TrainingsModule } from "src/modules/trainings/trainings.module";
import { UsersModule } from "src/modules/users/users.module";

const appConfig = configuration();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    JwtModule.register({}),
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), appConfig.uploadsDir),
      serveRoot: "/uploads",
    }),
    AuthModule,
    MailModule,
    StorageModule,
    StudentsModule,
    UsersModule,
    ExercisesModule,
    TrainingsModule,
    TrainingLogsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
