/**
 * Features:
 *  Security using bearer token
 *  parameter passed in a single object
 *  `
 *      { query:{"data.caseId":1023,"items.status":"wait"},
 *        data:{"approval","true"}
 *      }
 * `
 * 
 * 
 * 
 * bpmn microservices
 * require endpoints
 * 1. create new process defination
 * 2. start new process *
 * 3. update existing process
 * 4. cancel process *
 * 5. find my process *
 * 6. find all proccess by filter in current tenant *
 * 7. invoke process 
 * 8. get list of proccess
 * 9. get process definations
 * 10. get proccess file
 * 11. getproccessbyid
 * 12. get my proccess by candidate
 */

import { Controller, Get,Post,Req,Param,Body, Response, HttpCode, HttpStatus, HttpException, UseGuards, Query} from '@nestjs/common';
import { BPMNService } from './bpmn.service';
import {SampleApiSchema} from './bpmn.apischema'
import { ApiTags, ApiBody, ApiResponse, ApiOperation, ApiProperty, ApiBearerAuth } from '@nestjs/swagger';
import { SystemUser,BPMNAPI,APIData,APIEngine,APIModel, SecureUser } from 'bpmn-server';
import { AuthGuard} from './AuthGuard';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Injectable, Inject , Scope } from '@nestjs/common';

ApiTags('bpmn')

@ApiBearerAuth()
@Controller('bpmn')
@Injectable({ scope: Scope.REQUEST })
export class BPMNController {
  private api:BPMNAPI;
  private user;

  constructor(@Inject(REQUEST) private readonly request: Request,
              private readonly bpmnService: BPMNService) {
  
      this.api = bpmnService.api;

      if (BPMNService.securityEnabled()) {
        let hdrs=this.request.headers;
  
        let grps=(hdrs.usergroups as string).split(',');
  
        this.user = new SecureUser({userName:hdrs.username as string ,userGroups:grps,tenantId:hdrs.tenantid as string});
      }
      else
        this.user = SystemUser;
  }
  // ------------- model -----------------------
  //get Model list
  

  @Get('/model/list')
  @UseGuards(AuthGuard)
  //@ApiBody({ description: 'criteria in json format', type:SampleApiSchema})
  async getModelList(@Param('criteria') query: Object) {
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

