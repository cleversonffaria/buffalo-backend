import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { Request } from "express";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRole } from "src/common/enums/user-role.enum";
import { CreateStudentDto } from "src/modules/students/dto/create-student.dto";
import { StudentsService } from "src/modules/students/students.service";

@Controller("students")
@Roles(UserRole.TEACHER)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  createStudent(@Body() dto: CreateStudentDto, @Req() request: Request) {
    return this.studentsService.createStudent(dto, request);
  }

  @Get()
  getStudents(@Query("includeDeleted") includeDeleted: string | undefined, @Req() request: Request) {
    return this.studentsService.getStudents(includeDeleted === "true", request);
  }

  @Get(":id")
  getStudentById(
    @Param("id") id: string,
    @Query("includeDeleted") includeDeleted: string | undefined,
    @Req() request: Request
  ) {
    return this.studentsService.getStudentById(id, includeDeleted === "true", request);
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
