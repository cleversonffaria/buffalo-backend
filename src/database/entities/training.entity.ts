import { AppBaseEntity } from "src/database/entities/base.entity";
import { StudentTrainingEntity } from "src/database/entities/student-training.entity";
import { TrainingExerciseEntity } from "src/database/entities/training-exercise.entity";
import { UserEntity } from "src/database/entities/user.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

@Entity("trainings")
export class TrainingEntity extends AppBaseEntity {
  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ name: "teacher_id" })
  teacherId: string;

  @Column({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => UserEntity, (user) => user.trainings)
  @JoinColumn({ name: "teacher_id" })
  teacher: UserEntity;

  @OneToMany(() => TrainingExerciseEntity, (trainingExercise) => trainingExercise.training)
  trainingExercises: TrainingExerciseEntity[];

  @OneToMany(() => StudentTrainingEntity, (studentTraining) => studentTraining.training)
  studentTrainings: StudentTrainingEntity[];
}
