import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { UserRole } from "src/common/enums/user-role.enum";
import { ExerciseEntity } from "src/database/entities/exercise.entity";
import { StudentTrainingEntity } from "src/database/entities/student-training.entity";
import { TrainingLogEntity } from "src/database/entities/training-log.entity";
import { UserEntity } from "src/database/entities/user.entity";
import { UpdateUserDto } from "src/modules/users/dto/update-user.dto";
import { StudentsService } from "src/modules/students/students.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(ExerciseEntity)
    private readonly exercisesRepository: Repository<ExerciseEntity>,
    @InjectRepository(StudentTrainingEntity)
    private readonly studentTrainingsRepository: Repository<StudentTrainingEntity>,
    @InjectRepository(TrainingLogEntity)
    private readonly trainingLogsRepository: Repository<TrainingLogEntity>,
    private readonly studentsService: StudentsService
  ) {}

  async getTeacherStats() {
    const [studentsCount, exercisesCount] = await Promise.all([
      this.usersRepository.count({
        where: { role: UserRole.STUDENT, deletedAt: IsNull() },
      }),
      this.exercisesRepository.count({
        where: { deletedAt: IsNull() },
      }),
    ]);

    return {
      success: true,
      stats: {
        totalStudents: studentsCount,
        totalExercises: exercisesCount,
      },
    };
  }

  async getStudentStats(studentId: string) {
    const activeTrainings = await this.studentTrainingsRepository.find({
      where: { studentId, isActive: true },
    });

    const today = new Date();
    const currentWeekDay = today.getDay() === 0 ? "7" : today.getDay().toString();
    const inProgress = activeTrainings.filter((training) =>
      training.weekDays.includes(currentWeekDay)
    ).length;

    const logsCount = activeTrainings.length
      ? await this.trainingLogsRepository
          .createQueryBuilder("training_logs")
          .where("training_logs.student_training_id IN (:...ids)", {
            ids: activeTrainings.map((training) => training.id),
          })
          .getCount()
      : 0;

    return {
      success: true,
      stats: {
        totalTrainings: activeTrainings.length,
        inProgress,
        completed: logsCount,
      },
    };
  }

  async updateUser(userId: string, updates: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    user.name = updates.name ?? user.name;
    user.phone = updates.phone ?? user.phone;
    user.age = updates.age ?? user.age;
    user.gender = updates.gender ?? user.gender;
    user.goal = updates.goal ?? user.goal;
    user.avatarUrl = updates.avatar_url ?? user.avatarUrl;
    user.startDate = updates.start_date ?? user.startDate;

    await this.usersRepository.save(user);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        avatar_url: user.avatarUrl,
        role: user.role,
        goal: user.goal,
        start_date: user.startDate,
        deleted_at: user.deletedAt?.toISOString() || null,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      },
    };
  }

  deleteStudent(studentId: string) {
    return this.studentsService.softDeleteStudent(studentId);
  }

  restoreStudent(studentId: string) {
    return this.studentsService.restoreStudent(studentId);
  }
}
