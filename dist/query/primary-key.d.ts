import { DynamoDB } from 'aws-sdk';
import * as Metadata from '../metadata';
import { ITable, Table } from '../table';
import { TableProperties } from '../tables/properties';
import { Filters as QueryFilters, UpdateConditions } from './filters';
import { QueryOutput } from './output';
import { MagicSearch, MagicSearchInput } from './search';
declare type PrimaryKeyType = string | number | Date;
declare type RangePrimaryKeyType = PrimaryKeyType | void;
declare type PrimaryKeyBatchInput<HashKeyType extends PrimaryKeyType, RangeKeyType extends RangePrimaryKeyType> = [HashKeyType, RangeKeyType];
interface PrimaryKeyGetInput {
    projectionExpression?: DynamoDB.ProjectionExpression;
    consistent?: DynamoDB.ConsistentRead;
    returnConsumedCapacity?: DynamoDB.ReturnConsumedCapacity;
}
interface PrimaryKeyGetGetItemInput extends PrimaryKeyGetInput {
    key: DynamoDB.Key;
}
interface PrimaryKeyQueryInput {
    rangeOrder?: 'ASC' | 'DESC';
    limit?: number;
    exclusiveStartKey?: DynamoDB.Key;
    consistent?: boolean;
    select?: 'COUNT';
}
interface PrimaryKeyUpdateItem<T extends Table, HashKeyType extends PrimaryKeyType, RangeKeyType extends RangePrimaryKeyType> {
    hash: HashKeyType;
    range: RangeKeyType;
    changes: TableProperties<T>;
    conditions?: UpdateConditions<T>;
}
interface PrimaryKeyScanInput {
    limit?: number;
    totalSegments?: number;
    segment?: number;
    exclusiveStartKey?: DynamoDB.DocumentClient.Key;
    attributes?: string[];
    projectionExpression?: DynamoDB.ProjectionExpression;
    expressionAttributeNames?: DynamoDB.ExpressionAttributeNameMap;
}
export declare class PrimaryKey<T extends Table, HashKeyType extends PrimaryKeyType, RangeKeyType extends RangePrimaryKeyType> {
    readonly table: ITable<T>;
    readonly metadata: Metadata.Index.PrimaryKey;
    constructor(table: ITable<T>, metadata: Metadata.Index.PrimaryKey);
    getDeleteItemInput(hash: HashKeyType, range: RangeKeyType): DynamoDB.DeleteItemInput;
    /**
     * Deletes an item from DynamoDB without having to load it from DynamoDB.
     * It is recommended you specify additional conditions to ensure you are deleting the record you assume.
     *
     * If you have already loaded the the record, you can use `Table.delete()`.
     *
     * Performs a `DeleteItem` operation.
     * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteItem.html
     */
    delete(hash: HashKeyType, range: RangeKeyType): Promise<DynamoDB.Types.DeleteItemOutput>;
    getGetInput(input: PrimaryKeyGetGetItemInput): DynamoDB.GetItemInput;
    /**
     * Get an item by its primary key (hash and range).
     *
     * `.get({ hashPropName: 'value', rangePropName: 'value' })`
     * `.get(hash, range)`
     *
     * This can be used to load the complete document, helpful if you current have a
     * projected version with only some attributes:
     *
     *   `.get(instanceOfTable)`
     */
    get(filters: QueryFilters<T>, input?: PrimaryKeyGetInput): Promise<T | undefined>;
    get(hash: HashKeyType, range: RangeKeyType, input?: PrimaryKeyGetInput): Promise<T | undefined>;
    get(record: T, input?: PrimaryKeyGetInput): Promise<T | undefined>;
    /**
     * Get a batch of items from this table
     *
     * This has been replaced with `Dyngoose.BatchGet` and should no longer be used.
     * `Dyngoose.BatchGet` has more functionality, supports projects and optionally atomic operations.
     *
     * @deprecated
     */
    batchGet(inputs: Array<PrimaryKeyBatchInput<HashKeyType, RangeKeyType>>): Promise<T[]>;
    /**
     * Deletes several items at once.
     *
     * WARNING: This is not atomic.
     *          It is possible for some deletes to succeed with others fail.
     *          Use Dyngoose.Transaction to perform an atomic deletion.
     *
     * Internally, Dyngoose will chunk the request to bypass the DynamoDB limit of 100 items per batch write.
     *
     * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html
     */
    batchDelete(inputs: Array<PrimaryKeyBatchInput<HashKeyType, RangeKeyType>>): Promise<DynamoDB.BatchWriteItemOutput>;
    getQueryInput(input?: PrimaryKeyQueryInput): DynamoDB.QueryInput;
    query(filters: QueryFilters<T>, input?: PrimaryKeyQueryInput): Promise<QueryOutput<T>>;
    getScanInput(input?: PrimaryKeyScanInput, filters?: QueryFilters<T>): DynamoDB.ScanInput;
    scan(filters?: QueryFilters<T> | undefined | null, input?: PrimaryKeyScanInput): Promise<QueryOutput<T>>;
    /**
     * Query DynamoDB for what you need.
     *
     * Starts a MagicSearch using this GlobalSecondaryIndex.
     */
    search(filters?: QueryFilters<T>, input?: MagicSearchInput<T>): MagicSearch<T>;
    /**
     * Creates an instance of Table based on the key.
     *
     * Internally the record will be marked as existing, so when performing a .save() operation
     * it will use an UpdateItem operation which will only transmit the updated fields.
     *
     * This can lead to race conditions if not used properly. Try to use with save conditions.
     */
    fromKey(filters: QueryFilters<T>): T;
    fromKey(hash: HashKeyType, range: RangeKeyType): T;
    /**
     * This will create a temporary Table instance, then calls record.fromJSON() passing your requested changes.
     * record.fromJSON() handles setting and deleting attributes.
     *
     * It then has the Table.Schema build the DynamoDB.UpdateItemInput with all the requested changes.
     */
    update(input: PrimaryKeyUpdateItem<T, HashKeyType, RangeKeyType>): Promise<void>;
}
export {};
