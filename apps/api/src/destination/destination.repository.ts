import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DestinationDto } from './dto/destination.dto';
import { ListDestinationsQueryDto } from './dto/list-destinations-query.dto';

type DestinationRow = {
  data: Prisma.JsonObject;
};

@Injectable()
export class DestinationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListDestinationsQueryDto): Promise<DestinationDto[]> {
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;

    try {
      const rows = await this.prisma.$queryRaw<DestinationRow[]>(Prisma.sql`
        SELECT to_jsonb(d) AS data
        FROM public.destinos d
        ORDER BY d.id ASC
        LIMIT ${limit}
        OFFSET ${offset}
      `);

      return rows.map((row) => this.mapRow(row.data));
    } catch (error) {
      throw this.resolveDatabaseError(error);
    }
  }

  async findOne(id: number): Promise<DestinationDto> {
    try {
      const rows = await this.prisma.$queryRaw<DestinationRow[]>(Prisma.sql`
        SELECT to_jsonb(d) AS data
        FROM public.destinos d
        WHERE d.id = ${id}
        LIMIT 1
      `);

      const row = rows[0];
      if (!row) {
        throw new NotFoundException('Destino não encontrado.');
      }

      return this.mapRow(row.data);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw this.resolveDatabaseError(error);
    }
  }

  private mapRow(data: Prisma.JsonObject): DestinationDto {
    const rawId = data['id'];

    return {
      id: Number(rawId),
      data: data,
    };
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
