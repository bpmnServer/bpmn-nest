import { Module } from '@nestjs/common';
import { BPMNService } from './bpmn.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  providers: [BPMNService],
  imports: [EventEmitterModule.forRoot()]
})
export class BPMNModule {}
