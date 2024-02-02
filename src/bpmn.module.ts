import { Module } from '@nestjs/common';
import { BPMNService } from './bpmn.service';

@Module({
  providers: [BPMNService],
})
export class BPMNModule {}
