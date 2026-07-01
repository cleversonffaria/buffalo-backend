import { AppBaseEntity } from "src/database/entities/base.entity";
import { ExerciseEntity } from "src/database/entities/exercise.entity";
import { TrainingLogEntity } from "src/database/entities/training-log.entity";
import { TrainingEntity } from "src/database/entities/training.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

@Entity("training_exercises")
export class TrainingExerciseEntity extends AppBaseEntity {
  @Column({ name: "training_id" })
  trainingId: string;

  @Column({ name: "exercise_id" })
  exerciseId: string;

  @Column({ type: "int", default: 1 })
  sets: number;

  @Column({ type: "int", nullable: true })
  repetitions: number | null;

  @Column({ type: "decimal", nullable: true })
  load: number | null;

  @Column({ name: "rest_seconds", type: "int", nullable: true })
  restSeconds: number | null;

  @Column({ name: "order_index", type: "int", default: 0 })
  orderIndex: number;

  @Column({ type: "text", nullable: true })
  notes: string | null;

  @Column({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => TrainingEntity, (training) => training.trainingExercises, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "training_id" })
  training: TrainingEntity;

  @ManyToOne(() => ExerciseEntity, (exercise) => exercise.trainingExercises, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "exercise_id" })
  exercise: ExerciseEntity;

  @OneToMany(() => TrainingLogEntity, (trainingLog) => trainingLog.trainingExercise)
  trainingLogs: TrainingLogEntity[];
}
