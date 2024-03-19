import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { BPMNAPI, BPMNServer, DefaultAppDelegate, Logger, SystemUser } from "bpmn-server";
import { configuration} from '../WorkflowApp/configuration';
import "dotenv/config";


@Injectable()
export class WFService {
  constructor(){

  }

}
