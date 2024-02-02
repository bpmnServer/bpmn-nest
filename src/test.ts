
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';


import { BPMNModule } from './bpmn.module';
import { BPMNService } from './bpmn.service';
import { SystemUser } from 'bpmn-server';


class Test{
    bpmnService;
    api;
    constructor(bpmnService: BPMNService) {
        this.bpmnService=bpmnService;
        this.api=bpmnService.api;
    }

  async run() {

    var models=await this.api.model.list({},SystemUser);
    console.log('count of models',models.length);
  
    var list=await this.api.data.findInstances({},SystemUser,'Full');
    console.log('count of instances',list.length);
  
    var inst=await this.api.engine.start('Buy Used Car',{},SystemUser);
  
    console.log('new Instances has ',inst.instance.items.length,' items');
   
  
  }
  @OnEvent('start')
  handleOrderCreatedEvent(payload) {
    console.log('event handler',payload);
  // handle and process "OrderCreatedEvent" event
}

}

export {Test}