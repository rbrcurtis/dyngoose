import { DynamoDB } from '../dynamodb';
export declare function batchWrite(documentClient: DynamoDB, requests: DynamoDB.BatchWriteItemRequestMap[]): Promise<DynamoDB.BatchWriteItemOutput>;
