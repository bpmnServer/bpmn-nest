import { Injectable } from '@nestjs/common';


import { BPMNAPI, BPMNServer, DefaultAppDelegate, Logger, SystemUser } from "bpmn-server";
import { configuration} from './WorkflowApp/configuration';
import "dotenv/config";


@Injectable()
export class BPMNService {
  
  private readonly logger = new Logger({toConsole: true});

  server:BPMNServer
  api: BPMNAPI
  
  constructor(){
    this.server = new BPMNServer(configuration,this.logger, {cron:false});
    this.api =new BPMNAPI(this.server);
    
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
