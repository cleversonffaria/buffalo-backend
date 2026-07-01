import { ExerciseDifficulty } from "src/common/enums/exercise-difficulty.enum";
import { AppBaseEntity } from "src/database/entities/base.entity";
import { TrainingExerciseEntity } from "src/database/entities/training-exercise.entity";
import { UserEntity } from "src/database/entities/user.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

@Entity("exercises")
export class ExerciseEntity extends AppBaseEntity {
  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column("text", { name: "muscle_groups", array: true, default: [] })
  muscleGroups: string[];

  @Column()
  equipment: string;

  @Column({
    type: "enum",
    enum: ExerciseDifficulty,
    default: ExerciseDifficulty.BEGINNER,
  })
  difficulty: ExerciseDifficulty;

  @Column({ type: "text", nullable: true })
  instructions: string | null;

  @Column({ name: "image_url", type: "text", nullable: true })
  imageUrl: string | null;

  @Column({ name: "video_url", type: "text", nullable: true })
  videoUrl: string | null;

  @Column({ name: "created_by", nullable: true })
  createdBy: string | null;

  @Column({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => UserEntity, (user) => user.exercises, { nullable: true })
  @JoinColumn({ name: "created_by" })
  createdByUser: UserEntity | null;

  @OneToMany(() => TrainingExerciseEntity, (trainingExercise) => trainingExercise.exercise)
  trainingExercises: TrainingExerciseEntity[];
}
