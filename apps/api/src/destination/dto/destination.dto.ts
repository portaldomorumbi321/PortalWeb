import { ApiProperty } from '@nestjs/swagger';

export class DestinationDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: { id: 1, nome: 'Paris', pais: 'França' },
  })
  data!: Record<string, unknown>;
}
