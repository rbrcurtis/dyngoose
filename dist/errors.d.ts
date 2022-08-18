import { AWSError } from 'aws-sdk';
import { BatchWriteItemOutput } from 'aws-sdk/clients/dynamodb';
import { ITable } from './table';
export declare class DyngooseError extends Error {
    constructor(message: string);
}
export declare class HelpfulError extends DyngooseError {
    tableClass?: ITable<any> | undefined;
    queryInput?: any;
    tableName?: string;
    constructor(error: AWSError, tableClass?: ITable<any> | undefined, queryInput?: any);
}
export declare class SchemaError extends DyngooseError {
}
export declare class QueryError extends DyngooseError {
}
export declare class ValidationError extends DyngooseError {
}
export declare class BatchError extends DyngooseError {
    errors: HelpfulError[];
    output: BatchWriteItemOutput;
    constructor(message: string, errors: HelpfulError[], output: BatchWriteItemOutput);
}
