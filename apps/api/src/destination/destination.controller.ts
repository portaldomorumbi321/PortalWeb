import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DestinationService } from './destination.service';
import { DestinationDto } from './dto/destination.dto';
import { DestinationParamDto } from './dto/destination-param.dto';
import { ListDestinationsQueryDto } from './dto/list-destinations-query.dto';

@ApiTags('Destinations')
@Controller('destinations')
export class DestinationController {
  constructor(private readonly destinationService: DestinationService) {}

  @Get()
  @ApiOperation({ summary: 'Lista destinos' })
  @ApiOkResponse({ type: DestinationDto, isArray: true })
  findAll(@Query() query: ListDestinationsQueryDto): Promise<DestinationDto[]> {
    return this.destinationService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um destino por id' })
  @ApiOkResponse({ type: DestinationDto })
  findOne(@Param() params: DestinationParamDto): Promise<DestinationDto> {
    return this.destinationService.findOne(params.id);
  }
}
