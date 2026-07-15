import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DestinationController } from './destination.controller';
import { DestinationRepository } from './destination.repository';
import { DestinationService } from './destination.service';

@Module({
  imports: [PrismaModule],
  controllers: [DestinationController],
  providers: [DestinationService, DestinationRepository],
  exports: [DestinationService, DestinationRepository],
})
export class DestinationModule {}
