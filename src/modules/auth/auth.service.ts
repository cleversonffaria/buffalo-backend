import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { SignOptions } from "jsonwebtoken";
import { IsNull, Repository } from "typeorm";
import { CodePurpose } from "src/common/enums/code-purpose.enum";
import { UserRole } from "src/common/enums/user-role.enum";
import { JwtUser } from "src/common/interfaces/jwt-user.interface";
import configuration from "src/config/configuration";
import { PasswordResetCodeEntity } from "src/database/entities/password-reset-code.entity";
import { RefreshTokenEntity } from "src/database/entities/refresh-token.entity";
import { UserEntity } from "src/database/entities/user.entity";
import { ActivateAccountDto } from "src/modules/auth/dto/activate-account.dto";
import { LoginDto } from "src/modules/auth/dto/login.dto";
import { RefreshTokenDto } from "src/modules/auth/dto/refresh-token.dto";
import { RegisterDto } from "src/modules/auth/dto/register.dto";
import { ResetPasswordDto } from "src/modules/auth/dto/reset-password.dto";
import { SendResetCodeDto } from "src/modules/auth/dto/send-reset-code.dto";
import { VerifyCodeDto } from "src/modules/auth/dto/verify-code.dto";
import { MailService } from "src/modules/mail/mail.service";

@Injectable()
export class AuthService {
  private readonly config = configuration();

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(PasswordResetCodeEntity)
    private readonly codesRepository: Repository<PasswordResetCodeEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokensRepository: Repository<RefreshTokenEntity>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException("Já existe um usuário com este email");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      email: dto.email.toLowerCase(),
      name: dto.name,
      passwordHash,
      role: dto.role || UserRole.STUDENT,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.buildAuthResponse(savedUser);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException("Email ou senha incorretos");
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        "Conta não ativada. Use 'Primeiro Acesso' para definir sua senha."
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Email ou senha incorretos");
    }

    return this.buildAuthResponse(user);
  }

  async refresh(dto: RefreshTokenDto) {
    const payload = this.jwtService.verify<{ sub: string }>(dto.refreshToken, {
      secret: this.config.jwt.refreshSecret,
    });

    const tokenRecord = await this.refreshTokensRepository.findOne({
      where: { userId: payload.sub, revokedAt: IsNull() },
      relations: { user: true },
      order: { createdAt: "DESC" },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException("Sessão inválida");
    }

    const isMatch = await bcrypt.compare(dto.refreshToken, tokenRecord.tokenHash);
    if (!isMatch || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException("Sessão expirada");
    }

    return this.buildAuthResponse(tokenRecord.user);
  }

  async logout(dto: RefreshTokenDto) {
    const payload = this.jwtService.verify<{ sub: string }>(dto.refreshToken, {
      secret: this.config.jwt.refreshSecret,
    });

    const tokenRecord = await this.refreshTokensRepository.findOne({
      where: { userId: payload.sub, revokedAt: IsNull() },
      order: { createdAt: "DESC" },
    });

    if (tokenRecord) {
      tokenRecord.revokedAt = new Date();
      await this.refreshTokensRepository.save(tokenRecord);
    }

    return { success: true };
  }

  async me(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user || user.deletedAt) {
      throw new NotFoundException("Usuário não encontrado");
    }

    return this.serializeUser(user);
  }

  async lookupFirstAccess(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase(), role: UserRole.STUDENT },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException(
        "Email não encontrado. Verifique se foi cadastrado por um professor."
      );
    }

    return {
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
    };
  }

  async verifyActivationCode(dto: VerifyCodeDto) {
    const code = await this.findValidCode(dto.email, dto.code, CodePurpose.ACTIVATION);
    return {
      success: true,
      isValid: !!code,
    };
  }

  async activateAccount(dto: ActivateAccountDto) {
    const code = await this.findValidCode(dto.email, dto.code, CodePurpose.ACTIVATION);
    const user = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase(), role: UserRole.STUDENT },
    });

    if (!code || !user) {
      throw new BadRequestException("Código inválido ou usuário não encontrado");
    }

    user.passwordHash = await bcrypt.hash(dto.password, 10);
    await this.usersRepository.save(user);

    code.used = true;
    await this.codesRepository.save(code);

    return { success: true, user: this.serializeUser(user) };
  }

  async resendActivationCode(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase(), role: UserRole.STUDENT },
    });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    await this.invalidateCodes(email, CodePurpose.ACTIVATION);
    const code = await this.createCode(email, CodePurpose.ACTIVATION, 24);
    await this.mailService.sendActivationCode(email, code.code, user.name);

    return { success: true };
  }

  async sendResetCode(dto: SendResetCodeDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException("Usuário não encontrado");
    }

    await this.invalidateCodes(dto.email, CodePurpose.PASSWORD_RESET);
    const code = await this.createCode(dto.email, CodePurpose.PASSWORD_RESET, 1);
    await this.mailService.sendPasswordResetCode(dto.email, code.code, user.name);

    return { success: true };
  }

  async verifyResetCode(dto: VerifyCodeDto) {
    const code = await this.findValidCode(
      dto.email,
      dto.code,
      CodePurpose.PASSWORD_RESET
    );

    if (!code) {
      throw new BadRequestException("Código inválido ou expirado");
    }

    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const code = await this.findValidCode(
      dto.email,
      dto.code,
      CodePurpose.PASSWORD_RESET
    );
    const user = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!code || !user) {
      throw new BadRequestException("Código inválido ou usuário não encontrado");
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.save(user);

    code.used = true;
    await this.codesRepository.save(code);

    return { success: true };
  }

  private async buildAuthResponse(user: UserEntity) {
    const payload: JwtUser = {
      sub: user.id,
      role: user.role,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.jwt.accessSecret,
      expiresIn: this.config.jwt.accessExpiresIn as SignOptions["expiresIn"],
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.jwt.refreshSecret,
      expiresIn: this.config.jwt.refreshExpiresIn as SignOptions["expiresIn"],
    });

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.refreshTokensRepository.update(
      { userId: user.id, revokedAt: IsNull() },
      { revokedAt: new Date() }
    );

    await this.refreshTokensRepository.save(
      this.refreshTokensRepository.create({
        userId: user.id,
        tokenHash,
        expiresAt,
      })
    );

    return {
      success: true,
      user: this.serializeUser(user),
      accessToken,
      refreshToken,
    };
  }

  private serializeUser(user: UserEntity) {
    return {
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
    };
  }

  private async createCode(
    email: string,
    purpose: CodePurpose,
    expiresInHours: number
  ) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const code = this.codesRepository.create({
      email: email.toLowerCase(),
      code: Math.floor(100000 + Math.random() * 900000).toString(),
      purpose,
      expiresAt,
      used: false,
    });

    return this.codesRepository.save(code);
  }

  private async invalidateCodes(email: string, purpose: CodePurpose) {
    await this.codesRepository.update(
      { email: email.toLowerCase(), purpose, used: false },
      { used: true }
    );
  }

  private async findValidCode(email: string, code: string, purpose: CodePurpose) {
    return this.codesRepository.findOne({
      where: {
        email: email.toLowerCase(),
        code,
        purpose,
        used: false,
      },
      order: { createdAt: "DESC" },
    }).then((record) => {
      if (!record || record.expiresAt < new Date()) {
        return null;
      }

      return record;
    });
  }
}
