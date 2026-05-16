import { DynamoDB } from '../dynamodb';
import { Connection } from './connection';
export declare class DAXConnection implements Connection {
    constructor(options: {
        endpoints: string[];
        requestTimeout?: number;
    });
    get client(): DynamoDB;
}
