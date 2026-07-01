import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRole } from "src/common/enums/user-role.enum";
import { UpdateUserDto } from "src/modules/users/dto/update-user.dto";
import { UsersService } from "src/modules/users/users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("stats/teacher")
  @Roles(UserRole.TEACHER)
  getTeacherStats() {
    return this.usersService.getTeacherStats();
  }

  @Get("stats/student/:studentId")
  getStudentStats(@Param("studentId") studentId: string) {
    return this.usersService.getStudentStats(studentId);
  }

  @Patch(":id")
  updateUser(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Patch(":id/delete")
  @Roles(UserRole.TEACHER)
  deleteStudent(@Param("id") id: string) {
    return this.usersService.deleteStudent(id);
  }

  @Patch(":id/restore")
  @Roles(UserRole.TEACHER)
  restoreStudent(@Param("id") id: string) {
    return this.usersService.restoreStudent(id);
  }
}
