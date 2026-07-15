import { DestinationRepository } from './destination.repository';
import { DestinationDto } from './dto/destination.dto';
import { ListDestinationsQueryDto } from './dto/list-destinations-query.dto';
export declare class DestinationService {
    private readonly destinationRepository;
    constructor(destinationRepository: DestinationRepository);
    findAll(query: ListDestinationsQueryDto): Promise<DestinationDto[]>;
    findOne(id: number): Promise<DestinationDto>;
}
