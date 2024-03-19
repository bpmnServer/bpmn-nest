
import { Controller, Get,Post,Req,Param,Body, Response, HttpCode, HttpStatus, HttpException, UseGuards, Render} from '@nestjs/common';
import { BPMNService } from './bpmn.service';
import {SampleApiSchema} from './bpmn.apischema'
import { ApiTags, ApiBody, ApiResponse, ApiOperation, ApiProperty, ApiBearerAuth } from '@nestjs/swagger';
import { SystemUser,BPMNAPI,APIData,APIEngine,APIModel, SecureUser } from 'bpmn-server';
import { AuthGuard} from './AuthGuard';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Injectable, Inject , Scope } from '@nestjs/common';

ApiTags('wf')

@ApiBearerAuth()
@Controller('wf')
@Injectable({ scope: Scope.REQUEST })
export class WFController {
  private api:BPMNAPI;
  private user;

  constructor(@Inject(REQUEST) private readonly request: Request,
              private readonly bpmnService: BPMNService) {
  
      this.api = bpmnService.api;
      this.user= SystemUser;

      /*
      console.log('header',this.request.headers.userName);
      
      let hdrs=this.request.headers;

      let grps=(hdrs.usergroups as string).split(',');

      this.user = new SecureUser({userName:hdrs.username as string ,userGroups:grps,tenantId:hdrs.tenantid as string});
      console.log(this.user); */
  }
  
  @Get('/')
  @Render('index')
  async wfRoot() {
        console.log(' index controller');
        let user =this.user;
        var instances = await this.api.data.findInstances({}, user,'summary');
        let waiting = await this.api.data.findItems({ "items.status": 'wait', "items.type": 'bpmn:UserTask' }, user); 
    
        waiting.forEach(item => {
            item['fromNow'] = dateDiff(item.startedAt);
        });
    
    
        instances.forEach(item => {
            item['fromNow'] = dateDiff(item.startedAt);
            if (item.endedAt)
                item['endFromNow'] = dateDiff(item.endedAt);
            else
                item['endFromNow'] = '';
        });

        let list=[];
        let procs=await this.api.model.list({},SystemUser);
        procs.forEach(p=>{list.push(p['name']);});
        console.log('procs',procs.length);
        this.request.user = this.user;
        console.log('req.user',this.request.user);
        return { message: 'testing' ,
                title:'' , output:[], user,
                procs, 
                debugMsgs: [], // Logger.get(),
                waiting: waiting,
                instances,
                request: this.request,
                logs:[], items:[],
                //forUserGroups: this.request.session.forUserGroups, forUserName: this.request.session.forUserName
            };
   
  }


  // ------------- model -----------------------
  //get Model list
  @Post('/model/list')
  @UseGuards(AuthGuard)
  @ApiBody({ description: 'criteria in json format', type:SampleApiSchema})
  async getModelList(    
  @Body() query: Object) {
     var list=await this.api.model.list(query,this.user);
    return list;
  }

  // ------------- data -----------------------

  
  //get all workflow
  @Post('/data/findItems')
  @ApiBody({ description: 'criteria in json format', type:SampleApiSchema})
  async findItems(    
    @Body() query: Object,
    ) {
      
      let list=await this.api.data.findItems(query,this.user);
      return list;
  }

  @Post('/data/delete')
  @ApiBody({ description: 'criteria in json format', type:SampleApiSchema})
  async deleteInstance(    
    @Body() query: Object,
    ) {
      
      let list=await this.api.data.deleteInstances(query,this.user);
      return list;
  }

  //get all workflow
  @Post('/data/findPendingTasks')
  @ApiBody({ description: 'criteria in json format', type:SampleApiSchema})
  async getPendingTasks(    
    @Body() query: Object) {

    return this.api.data.getPendingUserTasks(query,this.user);
  }
  //list instances that are pending
    @Post('/data/findPendingWorkflows')
  async getPendingWorkflows(){

    const tmp:any[] = await this.api.data.findInstances({
          status:'running',
          },this.user,'summary');

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

  //create workflow
  @Post('start/:workflowname')
    @ApiBody({ description: 'create worflow, submit data in json format', type:SampleApiSchema})
    @ApiOperation({
      operationId: 'startWorkflow',
      description: 'start new workflow',
    })
    
  async startWorkflow(
    @Param('workflowname') workflowname:string,
    @Body() data: Object,
    ) {
    return this.resultResponse(await this.api.engine.start(workflowname,data,this.user));
  }

  //invoke workflow
  @Post('invoke/:workflowname')
      @ApiBody({ description: '{query:{},data:{}}', type:SampleApiSchema})
  async invoke(
      @Body() params: Object,
      ) {
      try {
        return this.resultResponse(await this.api.engine.invoke(params['query'],params['data'],this.user));

      }
      catch (exc) {
        throw new HttpException('Error:'+exc.message, HttpStatus.BAD_REQUEST);
//        return ({ errors: exc.message });
      }
  }

  resultResponse(result) {
   
      return result.instance;
  }
  // others required endpoint
  //get /:workflow/:id  //fetch info
  //put /:workflow/:id  //update info
  //post/:workflow/:id/:taskId  //invoke {user:xxx}
  //...
}

function dateDiff(val) {return val;}
  