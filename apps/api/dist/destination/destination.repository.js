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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinationRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let DestinationRepository = class DestinationRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const limit = query.limit ?? 50;
        const offset = query.offset ?? 0;
        try {
            const rows = await this.prisma.$queryRaw(client_1.Prisma.sql `
        SELECT to_jsonb(d) AS data
        FROM public.destinos d
        ORDER BY d.id ASC
        LIMIT ${limit}
        OFFSET ${offset}
      `);
            return rows.map((row) => this.mapRow(row.data));
        }
        catch (error) {
            throw this.resolveDatabaseError(error);
        }
    }
    async findOne(id) {
        try {
            const rows = await this.prisma.$queryRaw(client_1.Prisma.sql `
        SELECT to_jsonb(d) AS data
        FROM public.destinos d
        WHERE d.id = ${id}
        LIMIT 1
      `);
            const row = rows[0];
            if (!row) {
                throw new common_1.NotFoundException('Destino não encontrado.');
            }
            return this.mapRow(row.data);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw this.resolveDatabaseError(error);
        }
    }
    mapRow(data) {
        const rawId = data['id'];
        return {
            id: Number(rawId),
            data: data,
        };
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
exports.DestinationRepository = DestinationRepository;
exports.DestinationRepository = DestinationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DestinationRepository);
//# sourceMappingURL=destination.repository.js.map