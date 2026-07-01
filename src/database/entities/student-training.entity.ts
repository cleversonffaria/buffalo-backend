import { AppBaseEntity } from "src/database/entities/base.entity";
import { TrainingLogEntity } from "src/database/entities/training-log.entity";
import { TrainingEntity } from "src/database/entities/training.entity";
import { UserEntity } from "src/database/entities/user.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

@Entity("student_trainings")
export class StudentTrainingEntity extends AppBaseEntity {
  @Column({ name: "student_id" })
  studentId: string;

  @Column({ name: "training_id" })
  trainingId: string;

  @Column("text", { name: "week_days", array: true, default: [] })
  weekDays: string[];

  @Column({ name: "start_date", type: "date" })
  startDate: string;

  @Column({ name: "end_date", type: "date", nullable: true })
  endDate: string | null;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;

  @ManyToOne(() => UserEntity, (user) => user.studentTrainings, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "student_id" })
  student: UserEntity;

  @ManyToOne(() => TrainingEntity, (training) => training.studentTrainings, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "training_id" })
  training: TrainingEntity;

  @OneToMany(() => TrainingLogEntity, (trainingLog) => trainingLog.studentTraining)
  trainingLogs: TrainingLogEntity[];
}
