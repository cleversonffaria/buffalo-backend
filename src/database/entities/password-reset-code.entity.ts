import { CodePurpose } from "src/common/enums/code-purpose.enum";
import { AppBaseEntity } from "src/database/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity("password_reset_codes")
export class PasswordResetCodeEntity extends AppBaseEntity {
  @Column()
  email: string;

  @Column()
  code: string;

  @Column({ type: "enum", enum: CodePurpose, default: CodePurpose.ACTIVATION })
  purpose: CodePurpose;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt: Date;

  @Column({ type: "boolean", default: false })
  used: boolean;
}
