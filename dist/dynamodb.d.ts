/// <reference types="node" />
import { DynamoDBClient, type DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
declare type RequestListener = (response: {
    error?: Error & {
        cancellationReasons?: unknown;
    };
    httpResponse?: {
        body: Buffer;
    };
}) => void;
declare class Request<T> {
    private readonly send;
    private readonly listeners;
    constructor(send: () => Promise<T>);
    on(event: string, listener: RequestListener): this;
    promise(): Promise<T>;
}
export interface DynamoDBConfig extends DynamoDBClientConfig {
    accessKeyId?: string;
    secretAccessKey?: string;
}
export declare class DynamoDB {
    readonly client: DynamoDBClient;
    constructor(config?: DynamoDBConfig, client?: DynamoDBClient);
    putItem(input: DynamoDB.PutItemInput): Request<DynamoDB.PutItemOutput>;
    updateItem(input: DynamoDB.UpdateItemInput): Request<DynamoDB.UpdateItemOutput>;
    deleteItem(input: DynamoDB.DeleteItemInput): Request<DynamoDB.DeleteItemOutput>;
    getItem(input: DynamoDB.GetItemInput): Request<DynamoDB.GetItemOutput>;
    batchWriteItem(input: DynamoDB.BatchWriteItemInput): Request<DynamoDB.BatchWriteItemOutput>;
    batchGetItem(input: DynamoDB.BatchGetItemInput): Request<DynamoDB.BatchGetItemOutput>;
    transactWriteItems(input: DynamoDB.TransactWriteItemsInput): Request<DynamoDB.TransactWriteItemsOutput>;
    transactGetItems(input: DynamoDB.TransactGetItemsInput): Request<DynamoDB.TransactGetItemsOutput>;
    query(input: DynamoDB.QueryInput): Request<DynamoDB.QueryOutput>;
    scan(input: DynamoDB.ScanInput): Request<DynamoDB.ScanOutput>;
    createTable(input: DynamoDB.CreateTableInput): Request<DynamoDB.CreateTableOutput>;
    updateTable(input: DynamoDB.UpdateTableInput): Request<DynamoDB.UpdateTableOutput>;
    deleteTable(input: DynamoDB.DeleteTableInput): Request<DynamoDB.DeleteTableOutput>;
    describeTable(input: DynamoDB.DescribeTableInput): Request<DynamoDB.DescribeTableOutput>;
    describeTimeToLive(input: DynamoDB.DescribeTimeToLiveInput): Request<DynamoDB.DescribeTimeToLiveOutput>;
    updateTimeToLive(input: DynamoDB.UpdateTimeToLiveInput): Request<DynamoDB.UpdateTimeToLiveOutput>;
    updateContinuousBackups(input: DynamoDB.UpdateContinuousBackupsInput): Request<DynamoDB.UpdateContinuousBackupsOutput>;
    describeContinuousBackups(input: DynamoDB.DescribeContinuousBackupsInput): Request<DynamoDB.DescribeContinuousBackupsOutput>;
    waitFor(state: 'tableExists', input: DynamoDB.DescribeTableInput): Request<void>;
}
export declare namespace DynamoDB {
    interface AttributeValue {
        S?: string;
        N?: string;
        B?: Uint8Array | Buffer;
        SS?: string[];
        NS?: string[];
        BS?: Array<Uint8Array | Buffer>;
        M?: MapAttributeValue;
        L?: AttributeValue[];
        NULL?: boolean;
        BOOL?: boolean;
    }
    interface AttributeMap {
        [key: string]: AttributeValue;
    }
    interface BatchGetItemInput {
        RequestItems: BatchGetRequestMap;
        ReturnConsumedCapacity?: ReturnConsumedCapacity;
    }
    interface BatchGetItemOutput {
        Responses?: Record<string, AttributeMap[]> | Array<{
            Item?: AttributeMap;
        }>;
        UnprocessedKeys?: BatchGetRequestMap;
        ConsumedCapacity?: ConsumedCapacity[];
    }
    type BatchGetRequestMap = Record<string, {
        Keys: Key[];
        AttributesToGet?: string[];
        ConsistentRead?: boolean;
        ProjectionExpression?: string;
        ExpressionAttributeNames?: ExpressionAttributeNameMap;
    }>;
    interface BatchWriteItemInput {
        RequestItems: BatchWriteItemRequestMap;
        ReturnConsumedCapacity?: ReturnConsumedCapacity;
    }
    interface BatchWriteItemOutput {
        UnprocessedItems?: BatchWriteItemRequestMap;
        ItemCollectionMetrics?: Record<string, unknown>;
        ConsumedCapacity?: ConsumedCapacity[];
    }
    type BatchWriteItemRequestMap = Record<string, WriteRequest[]>;
    type BinaryAttributeValue = Uint8Array | Buffer;
    type BinarySetAttributeValue = Array<Uint8Array | Buffer>;
    type BillingMode = 'PROVISIONED' | 'PAY_PER_REQUEST' | string;
    type ClientConfiguration = DynamoDBConfig;
    type ConsistentRead = boolean;
    interface ConsumedCapacity {
        TableName?: string;
        CapacityUnits?: number;
        ReadCapacityUnits?: number;
        WriteCapacityUnits?: number;
        [key: string]: unknown;
    }
    type CreateGlobalSecondaryIndexAction = GlobalSecondaryIndex;
    interface CreateTableInput {
        AttributeDefinitions: Types.AttributeDefinition[];
        TableName: string;
        KeySchema: Types.KeySchemaElement[];
        LocalSecondaryIndexes?: LocalSecondaryIndex[];
        GlobalSecondaryIndexes?: GlobalSecondaryIndex[];
        BillingMode?: BillingMode;
        ProvisionedThroughput?: Types.ProvisionedThroughput;
        StreamSpecification?: StreamSpecification;
        [key: string]: unknown;
    }
    interface CreateTableOutput {
        TableDescription?: TableDescription;
    }
    interface Delete {
        Key: Key;
        TableName: string;
        ConditionExpression?: string;
        ExpressionAttributeNames?: ExpressionAttributeNameMap;
        ExpressionAttributeValues?: ExpressionAttributeValueMap;
    }
    interface DeleteItemInput {
        TableName: string;
        Key: Key;
        ConditionExpression?: string;
        ExpressionAttributeNames?: ExpressionAttributeNameMap;
        ExpressionAttributeValues?: ExpressionAttributeValueMap;
        ReturnConsumedCapacity?: ReturnConsumedCapacity;
        ReturnValues?: Types.ReturnValue;
    }
    interface DeleteItemOutput {
        Attributes?: AttributeMap;
    }
    interface DeleteRequest {
        Key: Key;
    }
    interface DeleteTableInput {
        TableName: string;
    }
    interface DeleteTableOutput {
        TableDescription?: TableDescription;
    }
    interface DescribeContinuousBackupsInput {
        TableName: string;
    }
    interface DescribeContinuousBackupsOutput {
        [key: string]: unknown;
    }
    interface DescribeTableInput {
        TableName: string;
    }
    interface DescribeTableOutput {
        Table?: TableDescription;
    }
    interface DescribeTimeToLiveInput {
        TableName: string;
    }
    interface DescribeTimeToLiveOutput {
        TimeToLiveDescription?: {
            TimeToLiveStatus?: string;
            AttributeName?: string;
        };
    }
    namespace DocumentClient {
        type Key = DynamoDB.Key;
    }
    type ExpressionAttributeNameMap = Record<string, string>;
    type ExpressionAttributeValueMap = Record<string, AttributeValue>;
    interface Get {
        Key: Key;
        TableName: string;
        ProjectionExpression?: string;
        ExpressionAttributeNames?: ExpressionAttributeNameMap;
    }
    type GetItem = GetItemOutput;
    interface GetItemInput {
        TableName: string;
        Key: Key;
        ProjectionExpression?: string;
        ConsistentRead?: boolean;
        ReturnConsumedCapacity?: ReturnConsumedCapacity;
    }
    interface GetItemOutput {
        Item?: AttributeMap;
        ConsumedCapacity?: ConsumedCapacity;
    }
    interface GlobalSecondaryIndex {
        IndexName?: string;
        KeySchema?: Types.KeySchemaElement[];
        Projection: Types.Projection;
        ProvisionedThroughput?: Types.ProvisionedThroughput;
    }
    type GlobalSecondaryIndexDescriptionList = GlobalSecondaryIndex[];
    interface GlobalSecondaryIndexUpdate {
        Create?: CreateGlobalSecondaryIndexAction;
        Delete?: {
            IndexName: string;
        };
        Update?: Record<string, unknown>;
    }
    type Key = Record<string, AttributeValue>;
    type KeySchema = Types.KeySchemaElement[];
    interface LocalSecondaryIndex {
        IndexName?: string;
        KeySchema?: Types.KeySchemaElement[];
        Projection: Types.Projection;
    }
    type MapAttributeValue = Record<string, AttributeValue>;
    type ProjectionExpression = string;
    interface Put {
        Item: AttributeMap;
        TableName: string;
        ConditionExpression?: string;
        ExpressionAttributeNames?: ExpressionAttributeNameMap;
        ExpressionAttributeValues?: ExpressionAttributeValueMap;
    }
    interface PutItemInput {
        TableName: string;
        Item: AttributeMap;
        ConditionExpression?: string;
        ExpressionAttributeNames?: ExpressionAttributeNameMap;
        ExpressionAttributeValues?: ExpressionAttributeValueMap;
        ReturnConsumedCapacity?: ReturnConsumedCapacity;
        ReturnValues?: Types.ReturnValue;
    }
    interface PutItemOutput {
        Attributes?: AttributeMap;
    }
    interface PutRequest {
        Item: AttributeMap;
    }
    interface QueryInput {
        TableName: string;
        IndexName?: string;
        KeyConditionExpression?: string;
        FilterExpression?: string;
        ProjectionExpression?: string;
        ExpressionAttributeNames?: ExpressionAttributeNameMap;
        ExpressionAttributeValues?: ExpressionAttributeValueMap;
        ExclusiveStartKey?: Key;
        Limit?: number;
        ScanIndexForward?: boolean;
        Select?: Select;
        ConsistentRead?: boolean;
        ReturnConsumedCapacity?: ReturnConsumedCapacity;
        Segment?: number;
        TotalSegments?: number;
    }
    interface QueryOutput {
        Items?: AttributeMap[];
        Count?: number;
        ScannedCount?: number;
        LastEvaluatedKey?: Key;
        ConsumedCapacity?: ConsumedCapacity;
    }
    type ReturnConsumedCapacity = 'INDEXES' | 'TOTAL' | 'NONE' | string;
    type ScanInput = QueryInput;
    type ScanOutput = QueryOutput;
    type ScanSegment = number;
    type ScanTotalSegments = number;
    type Select = 'ALL_ATTRIBUTES' | 'ALL_PROJECTED_ATTRIBUTES' | 'SPECIFIC_ATTRIBUTES' | 'COUNT' | string;
    interface StreamSpecification {
        StreamEnabled?: boolean;
        StreamViewType?: string;
    }
    type StringAttributeValue = string;
    type StringSetAttributeValue = string[];
    interface TableDescription {
        AttributeDefinitions?: Types.AttributeDefinition[];
        TableName?: string;
        KeySchema?: Types.KeySchemaElement[];
        TableStatus?: string;
        CreationDateTime?: Date;
        ProvisionedThroughput?: Types.ProvisionedThroughput;
        TableSizeBytes?: number;
        ItemCount?: number;
        TableArn?: string;
        LocalSecondaryIndexes?: LocalSecondaryIndex[];
        GlobalSecondaryIndexes?: GlobalSecondaryIndexDescriptionList;
        StreamSpecification?: StreamSpecification;
        LatestStreamLabel?: string;
        LatestStreamArn?: string;
        BillingModeSummary?: {
            BillingMode?: BillingMode;
        };
    }
    type TransactGetItemList = Array<{
        Get: Get;
    }>;
    interface TransactGetItemsInput {
        TransactItems: TransactGetItemList;
        ReturnConsumedCapacity?: ReturnConsumedCapacity;
    }
    interface TransactGetItemsOutput {
        Responses?: Array<{
            Item?: AttributeMap;
        }>;
        ConsumedCapacity?: ConsumedCapacity[];
    }
    interface TransactWriteItem {
        ConditionCheck?: {
            Key: Key;
            TableName: string;
            ConditionExpression: string;
            ExpressionAttributeNames?: ExpressionAttributeNameMap;
            ExpressionAttributeValues?: ExpressionAttributeValueMap;
        };
        Delete?: Delete;
        Put?: Put;
        Update?: {
            Key: Key;
            TableName: string;
            UpdateExpression?: string;
            ConditionExpression?: string;
            ExpressionAttributeNames?: ExpressionAttributeNameMap;
            ExpressionAttributeValues?: ExpressionAttributeValueMap;
        };
    }
    type TransactWriteItemList = TransactWriteItem[];
    interface TransactWriteItemsInput {
        TransactItems: TransactWriteItemList;
        ReturnConsumedCapacity?: ReturnConsumedCapacity;
    }
    interface TransactWriteItemsOutput {
        [key: string]: unknown;
    }
    interface UpdateContinuousBackupsInput {
        TableName: string;
        PointInTimeRecoverySpecification: {
            PointInTimeRecoveryEnabled: boolean;
        };
    }
    interface UpdateContinuousBackupsOutput {
        [key: string]: unknown;
    }
    interface UpdateItemInput {
        TableName: string;
        Key: Key;
        UpdateExpression?: string;
        ConditionExpression?: string;
        ExpressionAttributeNames?: ExpressionAttributeNameMap;
        ExpressionAttributeValues?: ExpressionAttributeValueMap;
        ReturnConsumedCapacity?: ReturnConsumedCapacity;
        ReturnValues?: Types.ReturnValue;
    }
    interface UpdateItemOutput {
        Attributes?: AttributeMap;
    }
    interface UpdateTableInput {
        TableName?: string;
        AttributeDefinitions?: Types.AttributeDefinition[];
        GlobalSecondaryIndexUpdates?: GlobalSecondaryIndexUpdate[];
    }
    interface UpdateTableOutput {
        TableDescription?: TableDescription;
    }
    interface UpdateTimeToLiveInput {
        TableName: string;
        TimeToLiveSpecification: {
            Enabled: boolean;
            AttributeName: string;
        };
    }
    interface UpdateTimeToLiveOutput {
        [key: string]: unknown;
    }
    interface WriteRequest {
        PutRequest?: PutRequest;
        DeleteRequest?: DeleteRequest;
    }
    namespace Types {
        interface AttributeDefinition {
            AttributeName?: string;
            AttributeType?: string;
        }
        type AttributeName = string;
        type AttributeValue = DynamoDB.AttributeValue;
        type BillingMode = DynamoDB.BillingMode;
        type ConsumedCapacity = DynamoDB.ConsumedCapacity;
        type CreateGlobalSecondaryIndexAction = DynamoDB.CreateGlobalSecondaryIndexAction;
        type DeleteItemOutput = DynamoDB.DeleteItemOutput;
        type GlobalSecondaryIndex = DynamoDB.GlobalSecondaryIndex;
        interface KeySchemaElement {
            AttributeName?: string;
            KeyType?: string;
        }
        type LocalSecondaryIndex = DynamoDB.LocalSecondaryIndex;
        interface Projection {
            ProjectionType?: string;
            NonKeyAttributes?: string[];
        }
        interface ProvisionedThroughput {
            ReadCapacityUnits?: number;
            WriteCapacityUnits?: number;
        }
        type ReturnValue = 'NONE' | 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW' | string;
        type ScalarAttributeType = string;
        type StreamSpecification = DynamoDB.StreamSpecification;
    }
}
export declare type AttributeValue = DynamoDB.AttributeValue;
export declare type BatchWriteItemOutput = DynamoDB.BatchWriteItemOutput;
export declare type BinarySetAttributeValue = DynamoDB.BinarySetAttributeValue;
export declare type ItemList = DynamoDB.AttributeMap[];
export {};
