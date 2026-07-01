import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { ExerciseEntity } from "src/database/entities/exercise.entity";
import { StudentTrainingEntity } from "src/database/entities/student-training.entity";
import { TrainingExerciseEntity } from "src/database/entities/training-exercise.entity";
import { TrainingEntity } from "src/database/entities/training.entity";
import {
  AssignTrainingDto,
  CreateTrainingDto,
  UpdateTrainingDto,
  UpdateStudentTrainingDto,
} from "src/modules/trainings/dto/create-training.dto";

@Injectable()
export class TrainingsService {
  constructor(
    @InjectRepository(TrainingEntity)
    private readonly trainingsRepository: Repository<TrainingEntity>,
    @InjectRepository(TrainingExerciseEntity)
    private readonly trainingExercisesRepository: Repository<TrainingExerciseEntity>,
    @InjectRepository(StudentTrainingEntity)
    private readonly studentTrainingsRepository: Repository<StudentTrainingEntity>,
    @InjectRepository(ExerciseEntity)
    private readonly exercisesRepository: Repository<ExerciseEntity>
  ) {}

  async createTraining(dto: CreateTrainingDto) {
    const training = await this.trainingsRepository.save(
      this.trainingsRepository.create({
        name: dto.name,
        description: dto.description || null,
        teacherId: dto.teacherId,
      })
    );

    if (dto.exercises.length) {
      await this.trainingExercisesRepository.save(
        dto.exercises.map((exercise) =>
          this.trainingExercisesRepository.create({
            trainingId: training.id,
            exerciseId: exercise.exerciseId,
            sets: exercise.sets,
            repetitions: exercise.repetitions ?? null,
            load: exercise.load ?? null,
            restSeconds: exercise.restSeconds ?? null,
            orderIndex: exercise.orderIndex,
          })
        )
      );
    }

    return { success: true, training: this.serializeTraining(training) };
  }

  async getTrainingsByTeacher(teacherId: string) {
    const trainings = await this.trainingsRepository.find({
      where: { teacherId, deletedAt: IsNull() },
      order: { createdAt: "DESC" },
    });

    return {
      success: true,
      trainings: trainings.map((training) => this.serializeTraining(training)),
    };
  }

  async getTrainingWithExercises(trainingId: string) {
    const training = await this.trainingsRepository.findOne({
      where: { id: trainingId, deletedAt: IsNull() },
      relations: {
        trainingExercises: {
          exercise: true,
        },
      },
    });

    if (!training) {
      throw new NotFoundException("Treino não encontrado");
    }

    return {
      success: true,
      training: {
        ...this.serializeTraining(training),
        training_exercises: training.trainingExercises
          .filter((item) => !item.deletedAt)
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((item) => ({
            id: item.id,
            training_id: item.trainingId,
            exercise_id: item.exerciseId,
            sets: item.sets,
            repetitions: item.repetitions,
            load:
              item.load === null || item.load === undefined
                ? null
                : Number(item.load),
            rest_seconds: item.restSeconds,
            order_index: item.orderIndex,
            notes: item.notes,
            deleted_at: item.deletedAt?.toISOString() || null,
            created_at: item.createdAt.toISOString(),
            updated_at: item.updatedAt.toISOString(),
            exercises: {
              id: item.exercise.id,
              name: item.exercise.name,
              muscle_groups: item.exercise.muscleGroups,
              equipment: item.exercise.equipment,
              difficulty: item.exercise.difficulty,
              description: item.exercise.description,
              video_url: item.exercise.videoUrl,
            },
          })),
      },
    };
  }

  async updateTraining(id: string, dto: UpdateTrainingDto) {
    const training = await this.trainingsRepository.findOne({ where: { id } });

    if (!training) {
      throw new NotFoundException("Treino não encontrado");
    }

    training.name = dto.name ?? training.name;
    training.description = dto.description ?? training.description;
    await this.trainingsRepository.save(training);

    return { success: true, training: this.serializeTraining(training) };
  }

  async deleteTraining(id: string) {
    const training = await this.trainingsRepository.findOne({ where: { id } });

    if (!training) {
      throw new NotFoundException("Treino não encontrado");
    }

    training.deletedAt = new Date();
    await this.trainingsRepository.save(training);
    return { success: true };
  }

  async assignTrainingToStudent(dto: AssignTrainingDto) {
    const studentTraining = await this.studentTrainingsRepository.save(
      this.studentTrainingsRepository.create({
        studentId: dto.studentId,
        trainingId: dto.trainingId,
        weekDays: dto.weekDays.map((day) => day.toString()),
        startDate: dto.startDate,
        endDate: dto.endDate || null,
        isActive: true,
      })
    );

    return {
      success: true,
      studentTraining: this.serializeStudentTraining(studentTraining),
    };
  }

  async getStudentTrainings(studentId: string, activeOnly = true) {
    const studentTrainings = await this.studentTrainingsRepository.find({
      where: {
        studentId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      relations: {
        training: {
          trainingExercises: {
            exercise: true,
          },
        },
      },
      order: { createdAt: "DESC" },
    });

    return {
      success: true,
      studentTrainings: studentTrainings.map((studentTraining) => ({
        ...this.serializeStudentTraining(studentTraining),
        trainings: {
          ...this.serializeTraining(studentTraining.training),
          training_exercises: studentTraining.training.trainingExercises
            .filter((item) => !item.deletedAt && !item.exercise.deletedAt)
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((item) => ({
              id: item.id,
              training_id: item.trainingId,
              exercise_id: item.exerciseId,
              sets: item.sets,
              repetitions: item.repetitions,
              load:
                item.load === null || item.load === undefined
                  ? null
                  : Number(item.load),
              rest_seconds: item.restSeconds,
              order_index: item.orderIndex,
              notes: item.notes,
              deleted_at: item.deletedAt?.toISOString() || null,
              created_at: item.createdAt.toISOString(),
              updated_at: item.updatedAt.toISOString(),
              exercises: {
                id: item.exercise.id,
                name: item.exercise.name,
                muscle_groups: item.exercise.muscleGroups,
                equipment: item.exercise.equipment,
                description: item.exercise.description,
                video_url: item.exercise.videoUrl,
              },
            })),
        },
      })),
    };
  }

  async updateStudentTraining(id: string, dto: UpdateStudentTrainingDto) {
    const studentTraining = await this.studentTrainingsRepository.findOne({
      where: { id },
    });

    if (!studentTraining) {
      throw new NotFoundException("Treino do aluno não encontrado");
    }

    studentTraining.weekDays = dto.week_days ?? studentTraining.weekDays;
    studentTraining.startDate = dto.start_date ?? studentTraining.startDate;
    studentTraining.endDate = dto.end_date ?? studentTraining.endDate;
    studentTraining.isActive = dto.is_active ?? studentTraining.isActive;

    await this.studentTrainingsRepository.save(studentTraining);

    return {
      success: true,
      studentTraining: this.serializeStudentTraining(studentTraining),
    };
  }

  async deactivateStudentTraining(id: string) {
    const studentTraining = await this.studentTrainingsRepository.findOne({
      where: { id },
    });

    if (!studentTraining) {
      throw new NotFoundException("Treino do aluno não encontrado");
    }

    studentTraining.isActive = false;
    await this.studentTrainingsRepository.save(studentTraining);
    return { success: true };
  }

  private serializeTraining(training: TrainingEntity) {
    return {
      id: training.id,
      name: training.name,
      description: training.description,
      teacher_id: training.teacherId,
      deleted_at: training.deletedAt?.toISOString() || null,
      created_at: training.createdAt.toISOString(),
      updated_at: training.updatedAt.toISOString(),
    };
  }

  private serializeStudentTraining(studentTraining: StudentTrainingEntity) {
    return {
      id: studentTraining.id,
      student_id: studentTraining.studentId,
      training_id: studentTraining.trainingId,
      week_days: studentTraining.weekDays,
      start_date: studentTraining.startDate,
      end_date: studentTraining.endDate,
      is_active: studentTraining.isActive,
      created_at: studentTraining.createdAt.toISOString(),
      updated_at: studentTraining.updatedAt.toISOString(),
    };
  }
}
