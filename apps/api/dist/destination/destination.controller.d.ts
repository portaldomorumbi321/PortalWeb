import { DestinationService } from './destination.service';
import { DestinationDto } from './dto/destination.dto';
import { DestinationParamDto } from './dto/destination-param.dto';
import { ListDestinationsQueryDto } from './dto/list-destinations-query.dto';
export declare class DestinationController {
    private readonly destinationService;
    constructor(destinationService: DestinationService);
    findAll(query: ListDestinationsQueryDto): Promise<DestinationDto[]>;
    findOne(params: DestinationParamDto): Promise<DestinationDto>;
}
