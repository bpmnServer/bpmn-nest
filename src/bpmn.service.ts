import { Injectable } from '@nestjs/common';

import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';


import { BPMNAPI, BPMNServer, DefaultAppDelegate, Logger, SystemUser } from "bpmn-server";
import { configuration} from './WorkflowApp/configuration';
import "dotenv/config";


@Injectable()
export class BPMNService {
  
  private readonly logger = new Logger({toConsole: false});
  private eventEmitter: EventEmitter2;
  bpmnServer:BPMNServer
  api: BPMNAPI
  
  constructor(){
    this.bpmnServer = new BPMNServer(configuration,this.logger, {cron:false});
    this.api =new BPMNAPI(this.bpmnServer);
   
    this.eventEmitter = new EventEmitter2();

    let self=this;
    this.bpmnServer.listener.on('all', async function ({ context, event, }) {
      console.log('emitting ',event);
      self.eventEmitter.emit(event,context);

    });
  
  }

  getHello(): string {
    return 'Welcome to bpmn world!';
  }
  async listModels() {

    console.log("listing Models");
    var list=await this.api.model.list({},SystemUser);
    list.forEach(m=>{console.log(m);});
    console.log();

  }
}
