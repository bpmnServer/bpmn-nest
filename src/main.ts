import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';


import { BPMNModule } from './bpmn.module';
import { BPMNService } from './bpmn.service';
import { SystemUser } from 'bpmn-server';


async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const appService = app.get(AppService);

  const bpmn = await NestFactory.createApplicationContext(BPMNModule);
  const bpmnSevice=bpmn.get(BPMNService);

  console.log('--- start ----');

//    console.log(app,appService);
    
  console.log(appService.getHello(),'appService');

  console.log(bpmnSevice.getHello(),'bpmnService');

  var list=await bpmnSevice.api.data.findInstances({},SystemUser,'Full');
  console.log(list.length);
  await bpmnSevice.listModels();

  console.log('--- bye ----');
  await app.close();
}
bootstrap();
