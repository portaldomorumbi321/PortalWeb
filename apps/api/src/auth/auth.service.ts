import crypto from 'node:crypto';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthUserDto } from './dto/auth-user.dto';

type FuncionarioRow = {
  id: number | bigint;
  nome: string;
  email: string;
  cargo: string | null;
  departamento: string | null;
  status: string;
  nivel_acesso: string;
  foto_url: string | null;
  iniciais: string | null;
  senha_hash: string | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(payload: LoginDto): Promise<LoginResponseDto> {
    const funcionario = await this.validateFuncionario(
      payload.email,
      payload.password,
    );

    const jwtPayload: JwtPayloadDto = {
      sub: funcionario.id,
      email: funcionario.email,
      accessLevel: funcionario.accessLevel,
    };

    const accessToken = await this.jwtService.signAsync(jwtPayload);

    return {
      message: 'Login realizado com sucesso.',
      accessToken,
      funcionario,
    };
  }

  async validateFuncionario(
    email: string,
    password: string,
  ): Promise<AuthUserDto> {
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPassword = typeof password === 'string' ? password : '';

    if (!normalizedEmail || !normalizedPassword) {
      throw new UnauthorizedException('E-mail e senha são obrigatórios.');
    }

    const funcionario = await this.findFuncionarioByEmail(normalizedEmail);

    if (!funcionario) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (funcionario.status !== 'Ativo') {
      throw new ForbiddenException('Funcionário inativo.');
    }

    if (!this.verifyPassword(normalizedPassword, funcionario.senha_hash)) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return this.mapFuncionario(funcionario);
  }

  async validateJwtPayload(payload: JwtPayloadDto): Promise<AuthUserDto> {
    const funcionario = await this.findFuncionarioByEmail(payload.email);

    if (!funcionario) {
      throw new UnauthorizedException('Usuário autenticado não encontrado.');
    }

    if (funcionario.status !== 'Ativo') {
      throw new ForbiddenException('Funcionário inativo.');
    }

    return this.mapFuncionario(funcionario);
  }

  private async findFuncionarioByEmail(
    email: string,
  ): Promise<FuncionarioRow | null> {
    try {
      const result = await this.prisma.$queryRaw<FuncionarioRow[]>(Prisma.sql`
        SELECT id, nome, email, cargo, departamento, status, nivel_acesso, foto_url, iniciais, senha_hash
        FROM public.funcionarios
        WHERE email = ${email}
        LIMIT 1
      `);

      return result[0] ?? null;
    } catch (error) {
      throw this.resolveDatabaseError(error);
    }
  }

  private verifyPassword(
    password: string,
    passwordHash: string | null,
  ): boolean {
    if (!password || !passwordHash) {
      return false;
    }

    const currentHash = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    return currentHash === passwordHash;
  }

  private mapFuncionario(row: FuncionarioRow): AuthUserDto {
    return {
      id: Number(row.id),
      name: row.nome,
      role: row.cargo || '',
      department: row.departamento || '',
      status: row.status,
      initials: row.iniciais || this.getInitials(row.nome),
      accessLevel: row.nivel_acesso,
      email: row.email,
      photo: row.foto_url || undefined,
    };
  }

  private getInitials(name: string): string {
    return String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  private resolveDatabaseError(error: unknown): InternalServerErrorException {
    const candidate = error as { code?: string } | undefined;

    if (candidate?.code === 'ENOTFOUND') {
      return new InternalServerErrorException(
        'Não foi possível resolver o host do banco (DNS). Verifique internet/VPN/DNS.',
      );
    }

    if (candidate?.code === 'ECONNREFUSED') {
      return new InternalServerErrorException(
        'Conexão com o banco recusada. Verifique a string de conexão e firewall.',
      );
    }

    if (candidate?.code === 'ETIMEDOUT') {
      return new InternalServerErrorException(
        'Tempo de conexão com o banco esgotado. Verifique rede e disponibilidade do Neon.',
      );
    }

    return new InternalServerErrorException(
      'Erro de conexão com o banco de dados.',
    );
  }
}
