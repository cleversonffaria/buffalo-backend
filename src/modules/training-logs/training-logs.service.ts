import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StudentTrainingEntity } from "src/database/entities/student-training.entity";
import { TrainingExerciseEntity } from "src/database/entities/training-exercise.entity";
import { TrainingLogEntity } from "src/database/entities/training-log.entity";
import {
  CreateTrainingLogDto,
  LogCompletedSetDto,
} from "src/modules/training-logs/dto/create-training-log.dto";

@Injectable()
export class TrainingLogsService {
  private readonly logger = new Logger(TrainingLogsService.name);

  constructor(
    @InjectRepository(TrainingLogEntity)
    private readonly trainingLogsRepository: Repository<TrainingLogEntity>,
    @InjectRepository(TrainingExerciseEntity)
    private readonly trainingExercisesRepository: Repository<TrainingExerciseEntity>,
    @InjectRepository(StudentTrainingEntity)
    private readonly studentTrainingsRepository: Repository<StudentTrainingEntity>
  ) {}

  async createLog(dto: CreateTrainingLogDto) {
    const trainingLog = await this.trainingLogsRepository.save(
      this.trainingLogsRepository.create({
        studentTrainingId: dto.studentTrainingId,
        trainingExerciseId: dto.trainingExerciseId,
        setsCompleted: dto.setsCompleted,
        repetitionsCompleted: dto.repetitionsCompleted ?? null,
        loadUsed: dto.weightUsed ?? null,
        durationSeconds: dto.durationSeconds ?? null,
        notes: dto.notes ?? null,
        completedAt: new Date(),
      })
    );

    return { success: true, trainingLog: this.serializeTrainingLog(trainingLog) };
  }

  async getLogsByTraining(studentTrainingId: string, date?: string) {
    const query = this.trainingLogsRepository.createQueryBuilder("training_log");
    query.where("training_log.student_training_id = :studentTrainingId", {
      studentTrainingId,
    });

    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      query.andWhere("training_log.completed_at BETWEEN :start AND :end", {
        start,
        end,
      });
    }

    const logs = await query.orderBy("training_log.completed_at", "DESC").getMany();

    return {
      success: true,
      trainingLogs: logs.map((log) => this.serializeTrainingLog(log)),
    };
  }

  async logCompletedSet(dto: LogCompletedSetDto) {
    const completedAt = dto.customDate
      ? new Date(`${dto.customDate}T12:00:00.000Z`)
      : new Date();

    this.logger.log(
      `Saving completed set studentTrainingId=${dto.studentTrainingId} exerciseId=${dto.exerciseId} setNumber=${dto.setNumber} completedAt=${completedAt.toISOString()}`
    );

    const trainingLog = await this.trainingLogsRepository.save(
      this.trainingLogsRepository.create({
        studentTrainingId: dto.studentTrainingId,
        trainingExerciseId: dto.exerciseId,
        setsCompleted: dto.setNumber,
        repetitionsCompleted: dto.repsCompleted,
        loadUsed: dto.weightUsed ?? null,
        durationSeconds: dto.duration ?? null,
        completedAt,
      })
    );

    this.logger.log(
      `Completed set saved trainingLogId=${trainingLog.id} studentTrainingId=${trainingLog.studentTrainingId} trainingExerciseId=${trainingLog.trainingExerciseId}`
    );

    return { success: true, trainingLog: this.serializeTrainingLog(trainingLog) };
  }

  async getProgressData(studentId: string, exerciseId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await this.trainingLogsRepository
      .createQueryBuilder("training_log")
      .innerJoinAndSelect("training_log.trainingExercise", "training_exercise")
      .innerJoinAndSelect("training_log.studentTraining", "student_training")
      .innerJoinAndSelect("training_exercise.exercise", "exercise")
      .where("student_training.student_id = :studentId", { studentId })
      .andWhere("training_exercise.exercise_id = :exerciseId", { exerciseId })
      .andWhere("training_log.completed_at >= :since", { since })
      .orderBy("training_log.completed_at", "ASC")
      .getMany();

    if (!logs.length) {
      throw new NotFoundException("Nenhum progresso encontrado");
    }

    return {
      success: true,
      progress: {
        exerciseId,
        exerciseName: logs[0].trainingExercise.exercise.name,
        logs: logs.map((log) => ({
          date: log.completedAt.toISOString(),
          weight:
            log.loadUsed === null || log.loadUsed === undefined
              ? null
              : Number(log.loadUsed),
          reps: log.repetitionsCompleted,
          sets: log.setsCompleted,
        })),
      },
    };
  }

  async getWorkoutSummary(studentTrainingId: string, date: string) {
    const logs = await this.trainingLogsRepository
      .createQueryBuilder("training_log")
      .innerJoinAndSelect("training_log.trainingExercise", "training_exercise")
      .innerJoinAndSelect("training_exercise.exercise", "exercise")
      .where("training_log.student_training_id = :studentTrainingId", {
        studentTrainingId,
      })
      .andWhere("DATE(training_log.completed_at) = :date", { date })
      .getMany();

    const grouped = new Map<
      string,
      {
        exerciseId: string;
        exerciseName: string;
        sets: number;
        weights: number[];
        reps: number[];
      }
    >();

    logs.forEach((log) => {
      const key = log.trainingExercise.exerciseId;
      const current = grouped.get(key) || {
        exerciseId: key,
        exerciseName: log.trainingExercise.exercise.name,
        sets: 0,
        weights: [],
        reps: [],
      };

      current.sets += log.setsCompleted;
      if (log.loadUsed !== null && log.loadUsed !== undefined) {
        current.weights.push(Number(log.loadUsed));
      }
      if (typeof log.repetitionsCompleted === "number") current.reps.push(log.repetitionsCompleted);

      grouped.set(key, current);
    });

    const exercises = Array.from(grouped.values()).map((item) => ({
      exerciseId: item.exerciseId,
      exerciseName: item.exerciseName,
      sets: item.sets,
      avgWeight: item.weights.length
        ? item.weights.reduce((sum, weight) => sum + weight, 0) / item.weights.length
        : null,
      avgReps: item.reps.length
        ? item.reps.reduce((sum, reps) => sum + reps, 0) / item.reps.length
        : null,
    }));

    return {
      success: true,
      summary: {
        totalExercises: exercises.length,
        totalSets: exercises.reduce((sum, exercise) => sum + exercise.sets, 0),
        totalDuration: logs.reduce(
          (sum, log) => sum + (log.durationSeconds || 0),
          0
        ),
        exercises,
      },
    };
  }

  private serializeTrainingLog(trainingLog: TrainingLogEntity) {
    return {
      id: trainingLog.id,
      student_training_id: trainingLog.studentTrainingId,
      training_exercise_id: trainingLog.trainingExerciseId,
      sets_completed: trainingLog.setsCompleted,
      repetitions_completed: trainingLog.repetitionsCompleted,
      load_used:
        trainingLog.loadUsed === null || trainingLog.loadUsed === undefined
          ? null
          : Number(trainingLog.loadUsed),
      duration_seconds: trainingLog.durationSeconds,
      notes: trainingLog.notes,
      completed_at: trainingLog.completedAt.toISOString(),
      created_at: trainingLog.createdAt.toISOString(),
      updated_at: trainingLog.updatedAt.toISOString(),
    };
  }
}
