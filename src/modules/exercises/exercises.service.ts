import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { ExerciseEntity } from "src/database/entities/exercise.entity";
import { CreateExerciseDto } from "src/modules/exercises/dto/create-exercise.dto";
import { UpdateExerciseDto } from "src/modules/exercises/dto/update-exercise.dto";

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(ExerciseEntity)
    private readonly exercisesRepository: Repository<ExerciseEntity>
  ) {}

  async createExercise(dto: CreateExerciseDto) {
    const exercise = this.exercisesRepository.create({
      name: dto.name,
      description: dto.description || null,
      muscleGroups: dto.muscle_groups,
      equipment: dto.equipment,
      difficulty: dto.difficulty,
      instructions: dto.instructions || null,
      imageUrl: dto.image_url || null,
      videoUrl: dto.video_url || null,
      createdBy: dto.created_by || null,
    });

    const savedExercise = await this.exercisesRepository.save(exercise);
    return { success: true, exercise: this.serializeExercise(savedExercise) };
  }

  async getExercises(filters: {
    muscleGroups?: string[];
    difficulty?: string;
    equipment?: string;
    search?: string;
  }) {
    const query = this.exercisesRepository.createQueryBuilder("exercise");
    query.where("exercise.deleted_at IS NULL");

    if (filters.muscleGroups?.length) {
      query.andWhere("exercise.muscle_groups && ARRAY[:...groups]::text[]", {
        groups: filters.muscleGroups,
      });
    }

    if (filters.difficulty) {
      query.andWhere("exercise.difficulty = :difficulty", {
        difficulty: filters.difficulty,
      });
    }

    if (filters.equipment) {
      query.andWhere("exercise.equipment = :equipment", {
        equipment: filters.equipment,
      });
    }

    if (filters.search) {
      query.andWhere("(exercise.name ILIKE :search OR exercise.description ILIKE :search)", {
        search: `%${filters.search}%`,
      });
    }

    const exercises = await query.orderBy("exercise.name", "ASC").getMany();
    return {
      success: true,
      exercises: exercises.map((exercise) => this.serializeExercise(exercise)),
    };
  }

  async getExerciseById(id: string) {
    const exercise = await this.exercisesRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!exercise) {
      throw new NotFoundException("Exercício não encontrado");
    }

    return { success: true, exercise: this.serializeExercise(exercise) };
  }

  async updateExercise(id: string, dto: UpdateExerciseDto) {
    const exercise = await this.exercisesRepository.findOne({ where: { id } });

    if (!exercise) {
      throw new NotFoundException("Exercício não encontrado");
    }

    exercise.name = dto.name ?? exercise.name;
    exercise.description = dto.description ?? exercise.description;
    exercise.muscleGroups = dto.muscle_groups ?? exercise.muscleGroups;
    exercise.equipment = dto.equipment ?? exercise.equipment;
    exercise.difficulty = dto.difficulty ?? exercise.difficulty;
    exercise.instructions = dto.instructions ?? exercise.instructions;
    exercise.imageUrl = dto.image_url ?? exercise.imageUrl;
    exercise.videoUrl = dto.video_url ?? exercise.videoUrl;

    await this.exercisesRepository.save(exercise);
    return { success: true, exercise: this.serializeExercise(exercise) };
  }

  async deleteExercise(id: string) {
    const exercise = await this.exercisesRepository.findOne({ where: { id } });

    if (!exercise) {
      throw new NotFoundException("Exercício não encontrado");
    }

    exercise.deletedAt = new Date();
    await this.exercisesRepository.save(exercise);
    return { success: true };
  }

  async getAvailableMuscleGroups() {
    const result = await this.exercisesRepository.find({
      where: { deletedAt: IsNull() },
      select: {
        muscleGroups: true,
      },
    });

    const muscleGroups = Array.from(
      new Set(result.flatMap((exercise) => exercise.muscleGroups))
    ).sort();

    return { success: true, muscleGroups };
  }

  async getAvailableEquipments() {
    const result = await this.exercisesRepository.find({
      where: { deletedAt: IsNull() },
      select: {
        equipment: true,
      },
    });

    const equipments = Array.from(
      new Set(result.map((exercise) => exercise.equipment).filter(Boolean))
    ).sort();

    return { success: true, equipments };
  }

  private serializeExercise(exercise: ExerciseEntity) {
    return {
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      muscle_groups: exercise.muscleGroups,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      instructions: exercise.instructions,
      image_url: exercise.imageUrl,
      video_url: exercise.videoUrl,
      created_by: exercise.createdBy,
      deleted_at: exercise.deletedAt?.toISOString() || null,
      created_at: exercise.createdAt.toISOString(),
      updated_at: exercise.updatedAt.toISOString(),
    };
  }
}
