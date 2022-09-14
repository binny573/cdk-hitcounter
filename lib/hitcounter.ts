import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import {Construct} from 'constructs';

export interface HitCounterProps{
/** the function for which we want to count url hits */
    downstream: lambda.IFunction; //Lambdas inherent insert function
}

export class HitCounter extends Construct{ //HitCounter is the CONSTRUCT 

    /** allows accessing the counter function */
    public readonly handler: lambda.Function;

    /** the hit counter table */
     public readonly table: dynamodb.Table;

    constructor(scope: Construct, id: string, props: HitCounterProps){
        super(scope, id);

        //table and handler are called by cdk-workshop-stack.ts
        const table = new dynamodb.Table(this, 'Hits', {
            partitionKey: { 
            name: 'path', 
            type: dynamodb.AttributeType.STRING 
        }
        });

        this.table = table; 
    
        this.handler = new lambda.Function(this, 'HitCounterHandler', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'hitcounter.handler',
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: table.tableName
            }
        });

    // grant the lambda role read/write permissions to our table
    table.grantReadWriteData(this.handler);

    // grant the lambda role invoke permissions to the downstream function
    props.downstream.grantInvoke(this.handler);
    }
}