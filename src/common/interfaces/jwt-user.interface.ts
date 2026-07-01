import { UserRole } from "src/common/enums/user-role.enum";

export interface JwtUser {
  sub: string;
  role: UserRole;
  email: string;
}
