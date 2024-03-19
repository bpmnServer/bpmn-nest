import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {writeFileSync} from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { BPMNService } from './bpmn/bpmn.service';
const yaml = require('yaml');
async function bootstrap() {
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

    setupSwagger(app);
    setupExpress(app);
  
  await app.listen(3000);
}
function setupExpress(app) {
  app.engine('pug', require('pug').__express)
  app.setViewEngine('pug');

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

}
function setupSwagger(app)
{

  let config;
  if (BPMNService.securityEnabled()) 
  { 

      config = new DocumentBuilder()
      .addBearerAuth().addApiKey()
      .addGlobalParameters(      {
                        name: 'userName',
                        in: 'header',
                      },{
                        name: 'userGroups',
                        in: 'header',
                      },{
                        name: 'tenantId',
                        in: 'header',
                      })
      .setTitle('bpmn-server 2 example')
      .setDescription('BPMN API description')
      .setVersion('1.0')
  
      //.addTag('bpmn')
      .build();
    }
    else {
      config = new DocumentBuilder()
      .addBearerAuth().addApiKey()
      .setTitle('bpmn-server 2 example')
      .setDescription('BPMN API description')
      .setVersion('1.0')
  
      //.addTag('bpmn')
      .build();

    }
    
  const document = SwaggerModule.createDocument(app, config);
  
  //swaggerUi.api.clientAuthorizations.add("customHeader1", new SwaggerClient.ApiKeyAuthorization("customHeader1", "value1", "header"));

    SwaggerModule.setup('api', app, document,{
        swaggerOptions: { showExtensions: true, persistAuthorization: true },
  }); 
  

  writeFileSync('./openapi.yaml', yaml.stringify(document));
  console.log('./openapi.yaml file written');
 

}
bootstrap();

