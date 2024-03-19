import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { BPMNAPI, BPMNServer, DefaultAppDelegate, Logger, SystemUser } from "bpmn-server";
import { configuration} from '../WorkflowApp/configuration';
import "dotenv/config";


@Injectable()
export class BPMNService {
  bpmnServer:BPMNServer;
  api: BPMNAPI;
  private readonly logger = new Logger({toConsole: false});
  private eventEmitter: EventEmitter2;

  constructor(){

    this.bpmnServer = new BPMNServer(configuration,this.logger, {cron:false});
    this.api =new BPMNAPI(this.bpmnServer);
    
    let self=this;

    this.eventEmitter = new EventEmitter2();

    this.bpmnServer.listener.on('all', async function ({ context, event, }) {
      console.log('emitting ',event);
      self.eventEmitter.emit(event,context);

    });
   
  }
  static securityEnabled(): boolean {
    if (process.env.REQUIRE_AUTHENTICATION=='true')
      return true;
    else
      return false;
  }
  async startWorkflow(workflow:string,data?:any){
    const result =  await this.bpmnServer.engine.start(workflow,data,null,'myuserid');    
    return {
      id: result.id,
      data:result.instance.data,
      status: result.status,
//      userId: result.userId
    }
  }
  async getPendingWorkflows(){
    const tmp:any[] = await this.bpmnServer.dataStore.findInstances({
      status:'running',
    },'summary')    
    const result = tmp.map((proc)=>({
      id: proc.id,
      userId: proc.userId,
      workflowname: proc.name,
      startedAt: proc.startedAt,
      tasks :proc.items
              .filter((task)=>task.status=='wait')
              .map((task)=>({
                id:task.id,
                type:task.type,
                status:task.status,
                name: task.name,
                assignee:task.assignee,
                candidateUsers:task.candidateUsers,
                candidateGroups:task.candidateGroups
              }))
    }))

    return result
  }
}
