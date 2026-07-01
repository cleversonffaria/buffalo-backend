import { AppBaseEntity } from "src/database/entities/base.entity";
import { StudentTrainingEntity } from "src/database/entities/student-training.entity";
import { TrainingExerciseEntity } from "src/database/entities/training-exercise.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from "typeorm";

@Entity("training_logs")
export class TrainingLogEntity extends AppBaseEntity {
  @Column({ name: "student_training_id" })
  studentTrainingId: string;

  @Column({ name: "training_exercise_id" })
  trainingExerciseId: string;

  @Column({ name: "sets_completed", type: "int", default: 0 })
  setsCompleted: number;

  @Column({ name: "repetitions_completed", type: "int", nullable: true })
  repetitionsCompleted: number | null;

  @Column({ name: "load_used", type: "decimal", nullable: true })
  loadUsed: number | null;

  @Column({ name: "duration_seconds", type: "int", nullable: true })
  durationSeconds: number | null;

  @Column({ type: "text", nullable: true })
  notes: string | null;

  @Column({ name: "completed_at", type: "timestamptz" })
  completedAt: Date;

  @ManyToOne(
    () => StudentTrainingEntity,
    (studentTraining) => studentTraining.trainingLogs,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "student_training_id" })
  studentTraining: StudentTrainingEntity;

  @ManyToOne(
    () => TrainingExerciseEntity,
    (trainingExercise) => trainingExercise.trainingLogs,
    { onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "training_exercise_id" })
  trainingExercise: TrainingExerciseEntity;
}
