
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';


import { BPMNModule } from './bpmn.module';
import { BPMNService } from './bpmn.service';
import { SystemUser } from 'bpmn-server';
import { Test } from './test';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const appService = app.get(AppService);

  const bpmn = await NestFactory.createApplicationContext(BPMNModule);
  const bpmnService=bpmn.get(BPMNService);

  console.log('--- start ----');

   
  console.log(appService.getHello(),'appService');

  console.log(bpmnService.getHello(),'bpmnService');

  const t=new Test(bpmnService);
  await t.run();
  
  console.log('--- bye ----');
  await app.close();
}

bootstrap();
