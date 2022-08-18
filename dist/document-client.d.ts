import { DynamoDB } from 'aws-sdk';
import { UpdateConditions } from './query/filters';
import { UpdateItemInputParams } from './query/update-item-input';
import { ITable, Table } from './table';
interface PutItemInputParams<T extends Table> extends UpdateItemInputParams<T> {
}
export declare class DocumentClient<T extends Table> {
    private readonly tableClass;
    constructor(tableClass: ITable<T>);
    getPutInput(record: T, params?: PutItemInputParams<T>): DynamoDB.PutItemInput;
    put(record: T, params?: PutItemInputParams<T>): Promise<DynamoDB.PutItemOutput>;
    getUpdateInput(record: T, params?: UpdateItemInputParams<T>): DynamoDB.UpdateItemInput;
    update(record: T, params?: UpdateItemInputParams<T>): Promise<DynamoDB.UpdateItemOutput>;
    batchPut(records: T[]): Promise<DynamoDB.BatchWriteItemOutput>;
    getDeleteInput(record: T, conditions?: UpdateConditions<T>): DynamoDB.DeleteItemInput;
    transactPut(records: T[]): Promise<DynamoDB.TransactWriteItemsOutput>;
    delete(record: T, conditions?: UpdateConditions<T>): Promise<DynamoDB.DeleteItemOutput>;
}
export {};
