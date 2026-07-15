import { Injectable } from '@nestjs/common';
import { DestinationRepository } from './destination.repository';
import { DestinationDto } from './dto/destination.dto';
import { ListDestinationsQueryDto } from './dto/list-destinations-query.dto';

@Injectable()
export class DestinationService {
  constructor(private readonly destinationRepository: DestinationRepository) {}

  findAll(query: ListDestinationsQueryDto): Promise<DestinationDto[]> {
    return this.destinationRepository.findAll(query);
  }

  findOne(id: number): Promise<DestinationDto> {
    return this.destinationRepository.findOne(id);
  }
}
