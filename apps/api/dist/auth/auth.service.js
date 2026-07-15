"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async login(payload) {
        const funcionario = await this.validateFuncionario(payload.email, payload.password);
        const jwtPayload = {
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
    async validateFuncionario(email, password) {
        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedPassword = typeof password === 'string' ? password : '';
        if (!normalizedEmail || !normalizedPassword) {
            throw new common_1.UnauthorizedException('E-mail e senha são obrigatórios.');
        }
        const funcionario = await this.findFuncionarioByEmail(normalizedEmail);
        if (!funcionario) {
            throw new common_1.UnauthorizedException('Credenciais inválidas.');
        }
        if (funcionario.status !== 'Ativo') {
            throw new common_1.ForbiddenException('Funcionário inativo.');
        }
        if (!this.verifyPassword(normalizedPassword, funcionario.senha_hash)) {
            throw new common_1.UnauthorizedException('Credenciais inválidas.');
        }
        return this.mapFuncionario(funcionario);
    }
    async validateJwtPayload(payload) {
        const funcionario = await this.findFuncionarioByEmail(payload.email);
        if (!funcionario) {
            throw new common_1.UnauthorizedException('Usuário autenticado não encontrado.');
        }
        if (funcionario.status !== 'Ativo') {
            throw new common_1.ForbiddenException('Funcionário inativo.');
        }
        return this.mapFuncionario(funcionario);
    }
    async findFuncionarioByEmail(email) {
        try {
            const result = await this.prisma.$queryRaw(client_1.Prisma.sql `
        SELECT id, nome, email, cargo, departamento, status, nivel_acesso, foto_url, iniciais, senha_hash
        FROM public.funcionarios
        WHERE email = ${email}
        LIMIT 1
      `);
            return result[0] ?? null;
        }
        catch (error) {
            throw this.resolveDatabaseError(error);
        }
    }
    verifyPassword(password, passwordHash) {
        if (!password || !passwordHash) {
            return false;
        }
        const currentHash = node_crypto_1.default
            .createHash('sha256')
            .update(password)
            .digest('hex');
        return currentHash === passwordHash;
    }
    mapFuncionario(row) {
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
    getInitials(name) {
        return String(name || '')
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join('')
            .toUpperCase();
    }
    resolveDatabaseError(error) {
        const candidate = error;
        if (candidate?.code === 'ENOTFOUND') {
            return new common_1.InternalServerErrorException('Não foi possível resolver o host do banco (DNS). Verifique internet/VPN/DNS.');
        }
        if (candidate?.code === 'ECONNREFUSED') {
            return new common_1.InternalServerErrorException('Conexão com o banco recusada. Verifique a string de conexão e firewall.');
        }
        if (candidate?.code === 'ETIMEDOUT') {
            return new common_1.InternalServerErrorException('Tempo de conexão com o banco esgotado. Verifique rede e disponibilidade do Neon.');
        }
        return new common_1.InternalServerErrorException('Erro de conexão com o banco de dados.');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map