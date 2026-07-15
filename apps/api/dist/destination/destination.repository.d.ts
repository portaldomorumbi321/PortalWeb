import { PrismaService } from '../prisma/prisma.service';
import { DestinationDto } from './dto/destination.dto';
import { ListDestinationsQueryDto } from './dto/list-destinations-query.dto';
export declare class DestinationRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: ListDestinationsQueryDto): Promise<DestinationDto[]>;
    findOne(id: number): Promise<DestinationDto>;
    private mapRow;
    private resolveDatabaseError;
}
