import { DynamoDB } from '../dynamodb';
import { Schema } from './schema';
export declare function createTable(schema: Schema, waitForReady?: boolean): Promise<DynamoDB.TableDescription>;
