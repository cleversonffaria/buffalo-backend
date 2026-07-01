import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PasswordResetCodeEntity } from "src/database/entities/password-reset-code.entity";
import { StudentTrainingEntity } from "src/database/entities/student-training.entity";
import { UserEntity } from "src/database/entities/user.entity";
import { MailModule } from "src/modules/mail/mail.module";
import { StudentsController } from "src/modules/students/students.controller";
import { StudentsService } from "src/modules/students/students.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      PasswordResetCodeEntity,
      StudentTrainingEntity,
    ]),
    MailModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
