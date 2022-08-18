import { DynamoDB } from 'aws-sdk';
import { DynamoReturnValues } from '../interfaces';
import { Table } from '../table';
import { UpdateConditions } from './filters';
export interface UpdateItemInputParams<T extends Table> {
    conditions?: UpdateConditions<T>;
    returnValues?: DynamoReturnValues;
    returnConsumedCapacity?: DynamoDB.ReturnConsumedCapacity;
}
interface UpdateItemInput extends DynamoDB.UpdateItemInput {
    UpdateExpression: string;
}
export declare function getUpdateItemInput<T extends Table>(record: T, params?: UpdateItemInputParams<T>): UpdateItemInput;
export {};
