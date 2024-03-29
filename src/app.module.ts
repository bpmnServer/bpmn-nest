import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {BPMNModule} from './bpmn/bpmn.module'
import { WFModule } from './bpmn/wf.module';

@Module({
  imports: [BPMNModule,WFModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
