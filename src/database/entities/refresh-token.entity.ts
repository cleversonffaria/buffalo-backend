import { AppBaseEntity } from "src/database/entities/base.entity";
import { UserEntity } from "src/database/entities/user.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from "typeorm";

@Entity("refresh_tokens")
export class RefreshTokenEntity extends AppBaseEntity {
  @Column({ name: "user_id" })
  userId: string;

  @Column({ name: "token_hash", type: "text" })
  tokenHash: string;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt: Date;

  @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
  revokedAt: Date | null;

  @ManyToOne(() => UserEntity, (user) => user.refreshTokens, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: UserEntity;
}
