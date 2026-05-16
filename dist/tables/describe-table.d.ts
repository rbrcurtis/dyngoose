import { DynamoDB } from '../dynamodb';
import { Schema } from './schema';
export declare function describeTable(schema: Schema): Promise<DynamoDB.TableDescription>;
