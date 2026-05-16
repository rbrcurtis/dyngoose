import { DynamoDB } from '../dynamodb';
export interface Connection {
    readonly client: DynamoDB;
}
