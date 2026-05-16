import { DynamoDB } from '../dynamodb';
import { Schema } from './schema';
export declare function createTableInput(schema: Schema, forCloudFormation?: boolean): DynamoDB.CreateTableInput;
