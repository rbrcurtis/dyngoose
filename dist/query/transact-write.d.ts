import { DynamoDB } from '../dynamodb';
export declare function transactWrite(documentClient: DynamoDB, requests: DynamoDB.TransactWriteItem[]): Promise<DynamoDB.TransactWriteItemsOutput>;
