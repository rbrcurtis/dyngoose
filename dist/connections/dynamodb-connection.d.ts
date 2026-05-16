import { DynamoDB, type DynamoDBConfig } from '../dynamodb';
import { Connection } from './connection';
interface DyngooseDynamoDBConnectionOptions extends DynamoDBConfig {
    enableAWSXray?: boolean;
}
export declare class DynamoDBConnection implements Connection {
    private readonly __client;
    constructor(options: DyngooseDynamoDBConnectionOptions);
    private httpAgent;
    get client(): DynamoDB;
}
export {};
