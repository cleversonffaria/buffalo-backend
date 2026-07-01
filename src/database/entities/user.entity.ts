import { GenderType } from "src/common/enums/gender-type.enum";
import { UserRole } from "src/common/enums/user-role.enum";
import {
  Column,
  Entity,
  OneToMany,
} from "typeorm";
import { AppBaseEntity } from "src/database/entities/base.entity";
import { ExerciseEntity } from "src/database/entities/exercise.entity";
import { RefreshTokenEntity } from "src/database/entities/refresh-token.entity";
import { StudentTrainingEntity } from "src/database/entities/student-training.entity";
import { TrainingEntity } from "src/database/entities/training.entity";

@Entity("users")
export class UserEntity extends AppBaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ name: "password_hash", type: "text", nullable: true })
  passwordHash: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone: string | null;

  @Column({ type: "int", nullable: true })
  age: number | null;

  @Column({ type: "enum", enum: GenderType, nullable: true })
  gender: GenderType | null;

  @Column({ name: "avatar_url", type: "text", nullable: true })
  avatarUrl: string | null;

  @Column({ type: "enum", enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ type: "text", nullable: true })
  goal: string | null;

  @Column({ name: "start_date", type: "date", nullable: true })
  startDate: string | null;

  @Column({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => ExerciseEntity, (exercise) => exercise.createdByUser)
  exercises: ExerciseEntity[];

  @OneToMany(() => TrainingEntity, (training) => training.teacher)
  trainings: TrainingEntity[];

  @OneToMany(() => StudentTrainingEntity, (studentTraining) => studentTraining.student)
  studentTrainings: StudentTrainingEntity[];

  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshTokenEntity[];
}
