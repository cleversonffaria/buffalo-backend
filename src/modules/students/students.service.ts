import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CodePurpose } from "src/common/enums/code-purpose.enum";
import { UserRole } from "src/common/enums/user-role.enum";
import { PasswordResetCodeEntity } from "src/database/entities/password-reset-code.entity";
import { StudentTrainingEntity } from "src/database/entities/student-training.entity";
import { UserEntity } from "src/database/entities/user.entity";
import { MailService } from "src/modules/mail/mail.service";
import { CreateStudentDto } from "src/modules/students/dto/create-student.dto";

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(PasswordResetCodeEntity)
    private readonly codesRepository: Repository<PasswordResetCodeEntity>,
    @InjectRepository(StudentTrainingEntity)
    private readonly studentTrainingsRepository: Repository<StudentTrainingEntity>,
    private readonly mailService: MailService
  ) {}

  async createStudent(dto: CreateStudentDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException("Já existe um usuário com este email");
    }

    const student = this.usersRepository.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      age: dto.age,
      gender: dto.gender,
      goal: dto.goal,
      avatarUrl: dto.avatar_url || null,
      role: UserRole.STUDENT,
      startDate: new Date().toISOString().slice(0, 10),
    });

    const savedStudent = await this.usersRepository.save(student);

    await this.codesRepository.update(
      { email: dto.email.toLowerCase(), purpose: CodePurpose.ACTIVATION, used: false },
      { used: true }
    );

    const activationCode = await this.codesRepository.save(
      this.codesRepository.create({
        email: dto.email.toLowerCase(),
        code: Math.floor(100000 + Math.random() * 900000).toString(),
        purpose: CodePurpose.ACTIVATION,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        used: false,
      })
    );

    try {
      await this.mailService.sendActivationCode(
        savedStudent.email,
        activationCode.code,
        savedStudent.name
      );
    } catch (error) {
      await this.codesRepository.delete({ id: activationCode.id });
      await this.usersRepository.delete({ id: savedStudent.id });
      throw new BadRequestException("Erro ao enviar email de ativação");
    }

    return {
      success: true,
      student: this.serializeStudent(savedStudent),
      activationCode: activationCode.code,
    };
  }

  async getStudents(includeDeleted = false) {
    const students = await this.usersRepository.find({
      where: {
        role: UserRole.STUDENT,
      },
      order: { createdAt: "DESC" },
    });

    return {
      success: true,
      students: students
        .filter((student) => includeDeleted || !student.deletedAt)
        .map((student) => this.serializeStudent(student)),
    };
  }

  async getStudentById(id: string, includeDeleted = false) {
    const student = await this.usersRepository.findOne({
      where: { id, role: UserRole.STUDENT },
    });

    if (!student || (!includeDeleted && student.deletedAt)) {
      throw new NotFoundException("Aluno não encontrado");
    }

    return {
      success: true,
      student: this.serializeStudent(student),
    };
  }

  async softDeleteStudent(studentId: string) {
    const student = await this.usersRepository.findOne({
      where: { id: studentId, role: UserRole.STUDENT },
    });

    if (!student) {
      throw new NotFoundException("Aluno não encontrado");
    }

    student.deletedAt = new Date();
    await this.usersRepository.save(student);
    await this.studentTrainingsRepository.update(
      { studentId },
      { isActive: false }
    );

    return { success: true };
  }

  async restoreStudent(studentId: string) {
    const student = await this.usersRepository.findOne({
      where: { id: studentId, role: UserRole.STUDENT },
    });

    if (!student) {
      throw new NotFoundException("Aluno não encontrado");
    }

    student.deletedAt = null;
    await this.usersRepository.save(student);
    await this.studentTrainingsRepository.update(
      { studentId },
      { isActive: true }
    );

    return { success: true };
  }

  private serializeStudent(student: UserEntity) {
    return {
      id: student.id,
      email: student.email,
      name: student.name,
      phone: student.phone,
      age: student.age,
      gender: student.gender,
      avatar_url: student.avatarUrl,
      role: student.role,
      goal: student.goal,
      start_date: student.startDate,
      deleted_at: student.deletedAt?.toISOString() || null,
      created_at: student.createdAt.toISOString(),
      updated_at: student.updatedAt.toISOString(),
    };
  }
}
