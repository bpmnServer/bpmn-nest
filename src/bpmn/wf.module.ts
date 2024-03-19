import { Module } from '@nestjs/common';
import {WFController} from './wf.controller'
import {WFService} from './wf.service'
import { MongooseModule } from '@nestjs/mongoose';
import { BPMNService } from './bpmn.service';

@Module({
  imports: [

  ],
  controllers: [    
    WFController,
  ],
  providers: [
    WFService, BPMNService
  ],
  exports: [
    WFService , BPMNService
  ],
})
export class WFModule {}
