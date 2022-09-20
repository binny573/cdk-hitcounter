//import { Stack, StackProps, App} from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import {HitCounter} from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';
import { Color } from 'aws-cdk-lib/aws-cloudwatch';
import * as Alexa from 'aws-cdk-lib/alexa-ask';

export class CdkWorkshopStack extends cdk.Stack {//CdkWorkshopStack is the stack that will envelope the construct HitCounter
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //Defining an AWS Lambda resource
    const hello = new lambda.Function(this, 'HelloHandler',{
      runtime: lambda.Runtime.NODEJS_14_X,   //Execution environmnet
      code: lambda.Code.fromAsset('lambda'), //Code loaded from lambda directory
      handler: 'hello.handler'               //file "hello" and function "handler"
    });

    //Defining HitCounter Resource
    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello
    });

    // defines an API Gateway REST API resource backed by our "hello/hitcounter" function.
    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
    });

    new TableViewer(this, 'ViewHitCounter',{
      title: 'Hello Hits',
      table: helloWithCounter.table
    });

    const cfnSkill= new Alexa.CfnSkill(this , 'AlexSkill',{
       authenticationConfiguration: {
    clientId: 'clientId',
    clientSecret: 'clientSecret',
    refreshToken: 'refreshToken',
  },
  skillPackage: {
    s3Bucket: 's3Bucket',
    s3Key: 's3Key',
  },
  vendorId: 'vendorId',
    });
  }
}