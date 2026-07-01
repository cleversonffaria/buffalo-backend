import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRole } from "src/common/enums/user-role.enum";
import { CreateStudentDto } from "src/modules/students/dto/create-student.dto";
import { StudentsService } from "src/modules/students/students.service";

@Controller("students")
@Roles(UserRole.TEACHER)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  createStudent(@Body() dto: CreateStudentDto) {
    return this.studentsService.createStudent(dto);
  }

  @Get()
  getStudents(@Query("includeDeleted") includeDeleted?: string) {
    return this.studentsService.getStudents(includeDeleted === "true");
  }

  @Get(":id")
  getStudentById(
    @Param("id") id: string,
    @Query("includeDeleted") includeDeleted?: string
  ) {
    return this.studentsService.getStudentById(id, includeDeleted === "true");
  }

  @Patch(":id/delete")
  softDeleteStudent(@Param("id") id: string) {
    return this.studentsService.softDeleteStudent(id);
  }

  @Patch(":id/restore")
  restoreStudent(@Param("id") id: string) {
    return this.studentsService.restoreStudent(id);
  }
}
