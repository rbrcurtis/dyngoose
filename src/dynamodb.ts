/* eslint-disable @typescript-eslint/no-namespace */
import {
  BatchGetItemCommand,
  BatchWriteItemCommand,
  CreateTableCommand,
  DeleteItemCommand,
  DeleteTableCommand,
  DescribeContinuousBackupsCommand,
  DescribeTableCommand,
  DescribeTimeToLiveCommand,
  DynamoDBClient,
  type DynamoDBClientConfig,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  TransactGetItemsCommand,
  TransactWriteItemsCommand,
  UpdateContinuousBackupsCommand,
  UpdateItemCommand,
  UpdateTableCommand,
  UpdateTimeToLiveCommand,
  waitUntilTableExists,
} from '@aws-sdk/client-dynamodb'

type RequestListener = (response: { error?: Error & { cancellationReasons?: unknown }; httpResponse?: { body: Buffer } }) => void

type DynamoAttribute = DynamoDB.AttributeValue

function isAttr(value: unknown): value is DynamoAttribute {
  return value != null && typeof value === 'object' && (
    'S' in value || 'N' in value || 'B' in value || 'SS' in value || 'NS' in value ||
    'BS' in value || 'M' in value || 'L' in value || 'NULL' in value || 'BOOL' in value
  )
}

function normalizeValue(value: DynamoAttribute): DynamoAttribute | null {
  if (value.S === '') return { NULL: true }
  if (value.B instanceof Uint8Array && value.B.length === 0) return { NULL: true }
  if (value.SS != null && value.SS.length === 0) return null
  if (value.NS != null && value.NS.length === 0) return null
  if (value.BS != null && value.BS.length === 0) return null
  return value
}

function normalizeMap(map: DynamoDB.AttributeMap): DynamoDB.AttributeMap {
  const normalized: DynamoDB.AttributeMap = {}
  for (const key of Object.keys(map)) {
    const value = normalizeValue(map[key])
    if (value != null) normalized[key] = value
  }
  return normalized
}

function normalizeInput(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(normalizeInput)
  if (isAttr(input)) return normalizeValue(input)
  if (input != null && typeof input === 'object') {
    const normalized: Record<string, unknown> = {}
    for (const key of Object.keys(input)) {
      const value = normalizeInput((input as Record<string, unknown>)[key])
      if (value != null) normalized[key] = value
    }
    return normalized
  }
  return input
}

function normalizeOutput(output: unknown): unknown {
  if (output != null && typeof output === 'object' && 'Attributes' in output) {
    const record = output as { Attributes?: DynamoDB.AttributeMap }
    if (record.Attributes != null) record.Attributes = normalizeMap(record.Attributes)
  }
  if (output != null && typeof output === 'object' && 'Item' in output) {
    const record = output as { Item?: DynamoDB.AttributeMap }
    if (record.Item != null) record.Item = normalizeMap(record.Item)
  }
  if (output != null && typeof output === 'object' && 'Items' in output) {
    const record = output as { Items?: DynamoDB.AttributeMap[] }
    if (record.Items != null) record.Items = record.Items.map(normalizeMap)
  }
  if (output != null && typeof output === 'object' && 'Responses' in output) {
    const record = output as { Responses?: Record<string, DynamoDB.AttributeMap[]> | Array<{ Item?: DynamoDB.AttributeMap }> }
    if (Array.isArray(record.Responses)) {
      for (const item of record.Responses) if (item.Item != null) item.Item = normalizeMap(item.Item)
    } else if (record.Responses != null) {
      for (const key of Object.keys(record.Responses)) record.Responses[key] = record.Responses[key].map(normalizeMap)
    }
  }
  return output
}

class Request<T> {
  private readonly listeners: Array<{ event: string; listener: RequestListener }> = []

  constructor(private readonly send: () => Promise<T>) {}

  public on(event: string, listener: RequestListener): this {
    this.listeners.push({ event, listener })
    return this
  }

  public async promise(): Promise<T> {
    try {
      return await this.send()
    } catch (err) {
      const error = err as Error & { CancellationReasons?: unknown; cancellationReasons?: unknown }
      error.cancellationReasons ??= error.CancellationReasons

      for (const item of this.listeners) {
        if (item.event === 'extractError') item.listener({ error })
      }
      throw error
    }
  }
}

export interface DynamoDBConfig extends DynamoDBClientConfig {
  accessKeyId?: string
  secretAccessKey?: string
}

export class DynamoDB {
  public readonly client: DynamoDBClient

  constructor(config: DynamoDBConfig = {}, client?: DynamoDBClient) {
    const { accessKeyId, secretAccessKey, ...clientConfig } = config
    if (accessKeyId != null && secretAccessKey != null) clientConfig.credentials = { accessKeyId, secretAccessKey }
    this.client = client == null ? new DynamoDBClient(clientConfig) : client
  }

  public putItem(input: DynamoDB.PutItemInput): Request<DynamoDB.PutItemOutput> {
    return new Request(async () => normalizeOutput(await this.client.send(new PutItemCommand(normalizeInput(input) as never))) as DynamoDB.PutItemOutput)
  }

  public updateItem(input: DynamoDB.UpdateItemInput): Request<DynamoDB.UpdateItemOutput> {
    return new Request(async () => normalizeOutput(await this.client.send(new UpdateItemCommand(normalizeInput(input) as never))) as DynamoDB.UpdateItemOutput)
  }

  public deleteItem(input: DynamoDB.DeleteItemInput): Request<DynamoDB.DeleteItemOutput> {
    return new Request(async () => normalizeOutput(await this.client.send(new DeleteItemCommand(normalizeInput(input) as never))) as DynamoDB.DeleteItemOutput)
  }

  public getItem(input: DynamoDB.GetItemInput): Request<DynamoDB.GetItemOutput> {
    return new Request(async () => normalizeOutput(await this.client.send(new GetItemCommand(normalizeInput(input) as never))) as DynamoDB.GetItemOutput)
  }

  public batchWriteItem(input: DynamoDB.BatchWriteItemInput): Request<DynamoDB.BatchWriteItemOutput> {
    return new Request(async () => normalizeOutput(await this.client.send(new BatchWriteItemCommand(normalizeInput(input) as never))) as DynamoDB.BatchWriteItemOutput)
  }

  public batchGetItem(input: DynamoDB.BatchGetItemInput): Request<DynamoDB.BatchGetItemOutput> {
    return new Request(async () => normalizeOutput(await this.client.send(new BatchGetItemCommand(normalizeInput(input) as never))) as DynamoDB.BatchGetItemOutput)
  }

  public transactWriteItems(input: DynamoDB.TransactWriteItemsInput): Request<DynamoDB.TransactWriteItemsOutput> {
    return new Request(async () => await this.client.send(new TransactWriteItemsCommand(normalizeInput(input) as never)) as unknown as DynamoDB.TransactWriteItemsOutput)
  }

  public transactGetItems(input: DynamoDB.TransactGetItemsInput): Request<DynamoDB.TransactGetItemsOutput> {
    return new Request(async () => normalizeOutput(await this.client.send(new TransactGetItemsCommand(normalizeInput(input) as never))) as DynamoDB.TransactGetItemsOutput)
  }

  public query(input: DynamoDB.QueryInput): Request<DynamoDB.QueryOutput> {
    return new Request(async () => normalizeOutput(await this.client.send(new QueryCommand(normalizeInput(input) as never))) as DynamoDB.QueryOutput)
  }

  public scan(input: DynamoDB.ScanInput): Request<DynamoDB.ScanOutput> {
    return new Request(async () => normalizeOutput(await this.client.send(new ScanCommand(normalizeInput(input) as never))) as DynamoDB.ScanOutput)
  }

  public createTable(input: DynamoDB.CreateTableInput): Request<DynamoDB.CreateTableOutput> {
    return new Request(async () => await this.client.send(new CreateTableCommand(input as never)) as unknown as DynamoDB.CreateTableOutput)
  }

  public updateTable(input: DynamoDB.UpdateTableInput): Request<DynamoDB.UpdateTableOutput> {
    return new Request(async () => await this.client.send(new UpdateTableCommand(input as never)) as unknown as DynamoDB.UpdateTableOutput)
  }

  public deleteTable(input: DynamoDB.DeleteTableInput): Request<DynamoDB.DeleteTableOutput> {
    return new Request(async () => await this.client.send(new DeleteTableCommand(input as never)) as unknown as DynamoDB.DeleteTableOutput)
  }

  public describeTable(input: DynamoDB.DescribeTableInput): Request<DynamoDB.DescribeTableOutput> {
    return new Request(async () => await this.client.send(new DescribeTableCommand(input as never)) as unknown as DynamoDB.DescribeTableOutput)
  }

  public describeTimeToLive(input: DynamoDB.DescribeTimeToLiveInput): Request<DynamoDB.DescribeTimeToLiveOutput> {
    return new Request(async () => await this.client.send(new DescribeTimeToLiveCommand(input as never)) as unknown as DynamoDB.DescribeTimeToLiveOutput)
  }

  public updateTimeToLive(input: DynamoDB.UpdateTimeToLiveInput): Request<DynamoDB.UpdateTimeToLiveOutput> {
    return new Request(async () => await this.client.send(new UpdateTimeToLiveCommand(input as never)) as unknown as DynamoDB.UpdateTimeToLiveOutput)
  }

  public updateContinuousBackups(input: DynamoDB.UpdateContinuousBackupsInput): Request<DynamoDB.UpdateContinuousBackupsOutput> {
    return new Request(async () => await this.client.send(new UpdateContinuousBackupsCommand(input as never)) as unknown as DynamoDB.UpdateContinuousBackupsOutput)
  }

  public describeContinuousBackups(input: DynamoDB.DescribeContinuousBackupsInput): Request<DynamoDB.DescribeContinuousBackupsOutput> {
    return new Request(async () => await this.client.send(new DescribeContinuousBackupsCommand(input as never)) as unknown as DynamoDB.DescribeContinuousBackupsOutput)
  }

  public waitFor(state: 'tableExists', input: DynamoDB.DescribeTableInput): Request<void> {
    return new Request(async () => { await waitUntilTableExists({ client: this.client, maxWaitTime: 300 }, input) })
  }
}

export namespace DynamoDB {
  export interface AttributeValue { S?: string; N?: string; B?: Uint8Array | Buffer; SS?: string[]; NS?: string[]; BS?: Array<Uint8Array | Buffer>; M?: MapAttributeValue; L?: AttributeValue[]; NULL?: boolean; BOOL?: boolean }
  export interface AttributeMap { [key: string]: AttributeValue }
  export interface BatchGetItemInput { RequestItems: BatchGetRequestMap; ReturnConsumedCapacity?: ReturnConsumedCapacity }
  export interface BatchGetItemOutput { Responses?: Record<string, AttributeMap[]> | Array<{ Item?: AttributeMap }>; UnprocessedKeys?: BatchGetRequestMap; ConsumedCapacity?: ConsumedCapacity[] }
  export type BatchGetRequestMap = Record<string, { Keys: Key[]; AttributesToGet?: string[]; ConsistentRead?: boolean; ProjectionExpression?: string; ExpressionAttributeNames?: ExpressionAttributeNameMap }>
  export interface BatchWriteItemInput { RequestItems: BatchWriteItemRequestMap; ReturnConsumedCapacity?: ReturnConsumedCapacity }
  export interface BatchWriteItemOutput { UnprocessedItems?: BatchWriteItemRequestMap; ItemCollectionMetrics?: Record<string, unknown>; ConsumedCapacity?: ConsumedCapacity[] }
  export type BatchWriteItemRequestMap = Record<string, WriteRequest[]>
  export type BinaryAttributeValue = Uint8Array | Buffer
  export type BinarySetAttributeValue = Array<Uint8Array | Buffer>
  export type BillingMode = 'PROVISIONED' | 'PAY_PER_REQUEST' | string
  export type ClientConfiguration = DynamoDBConfig
  export type ConsistentRead = boolean
  export interface ConsumedCapacity { TableName?: string; CapacityUnits?: number; ReadCapacityUnits?: number; WriteCapacityUnits?: number; [key: string]: unknown }
  export type CreateGlobalSecondaryIndexAction = GlobalSecondaryIndex
  export interface CreateTableInput { AttributeDefinitions: Types.AttributeDefinition[]; TableName: string; KeySchema: Types.KeySchemaElement[]; LocalSecondaryIndexes?: LocalSecondaryIndex[]; GlobalSecondaryIndexes?: GlobalSecondaryIndex[]; BillingMode?: BillingMode; ProvisionedThroughput?: Types.ProvisionedThroughput; StreamSpecification?: StreamSpecification; [key: string]: unknown }
  export interface CreateTableOutput { TableDescription?: TableDescription }
  export interface Delete { Key: Key; TableName: string; ConditionExpression?: string; ExpressionAttributeNames?: ExpressionAttributeNameMap; ExpressionAttributeValues?: ExpressionAttributeValueMap }
  export interface DeleteItemInput { TableName: string; Key: Key; ConditionExpression?: string; ExpressionAttributeNames?: ExpressionAttributeNameMap; ExpressionAttributeValues?: ExpressionAttributeValueMap; ReturnConsumedCapacity?: ReturnConsumedCapacity; ReturnValues?: Types.ReturnValue }
  export interface DeleteItemOutput { Attributes?: AttributeMap }
  export interface DeleteRequest { Key: Key }
  export interface DeleteTableInput { TableName: string }
  export interface DeleteTableOutput { TableDescription?: TableDescription }
  export interface DescribeContinuousBackupsInput { TableName: string }
  export interface DescribeContinuousBackupsOutput { [key: string]: unknown }
  export interface DescribeTableInput { TableName: string }
  export interface DescribeTableOutput { Table?: TableDescription }
  export interface DescribeTimeToLiveInput { TableName: string }
  export interface DescribeTimeToLiveOutput { TimeToLiveDescription?: { TimeToLiveStatus?: string; AttributeName?: string } }
  export namespace DocumentClient { export type Key = DynamoDB.Key }
  export type ExpressionAttributeNameMap = Record<string, string>
  export type ExpressionAttributeValueMap = Record<string, AttributeValue>
  export interface Get { Key: Key; TableName: string; ProjectionExpression?: string; ExpressionAttributeNames?: ExpressionAttributeNameMap }
  export type GetItem = GetItemOutput
  export interface GetItemInput { TableName: string; Key: Key; ProjectionExpression?: string; ConsistentRead?: boolean; ReturnConsumedCapacity?: ReturnConsumedCapacity }
  export interface GetItemOutput { Item?: AttributeMap; ConsumedCapacity?: ConsumedCapacity }
  export interface GlobalSecondaryIndex { IndexName?: string; KeySchema?: Types.KeySchemaElement[]; Projection: Types.Projection; ProvisionedThroughput?: Types.ProvisionedThroughput }
  export type GlobalSecondaryIndexDescriptionList = GlobalSecondaryIndex[]
  export interface GlobalSecondaryIndexUpdate { Create?: CreateGlobalSecondaryIndexAction; Delete?: { IndexName: string }; Update?: Record<string, unknown> }
  export type Key = Record<string, AttributeValue>
  export type KeySchema = Types.KeySchemaElement[]
  export interface LocalSecondaryIndex { IndexName?: string; KeySchema?: Types.KeySchemaElement[]; Projection: Types.Projection }
  export type MapAttributeValue = Record<string, AttributeValue>
  export type ProjectionExpression = string
  export interface Put { Item: AttributeMap; TableName: string; ConditionExpression?: string; ExpressionAttributeNames?: ExpressionAttributeNameMap; ExpressionAttributeValues?: ExpressionAttributeValueMap }
  export interface PutItemInput { TableName: string; Item: AttributeMap; ConditionExpression?: string; ExpressionAttributeNames?: ExpressionAttributeNameMap; ExpressionAttributeValues?: ExpressionAttributeValueMap; ReturnConsumedCapacity?: ReturnConsumedCapacity; ReturnValues?: Types.ReturnValue }
  export interface PutItemOutput { Attributes?: AttributeMap }
  export interface PutRequest { Item: AttributeMap }
  export interface QueryInput { TableName: string; IndexName?: string; KeyConditionExpression?: string; FilterExpression?: string; ProjectionExpression?: string; ExpressionAttributeNames?: ExpressionAttributeNameMap; ExpressionAttributeValues?: ExpressionAttributeValueMap; ExclusiveStartKey?: Key; Limit?: number; ScanIndexForward?: boolean; Select?: Select; ConsistentRead?: boolean; ReturnConsumedCapacity?: ReturnConsumedCapacity; Segment?: number; TotalSegments?: number }
  export interface QueryOutput { Items?: AttributeMap[]; Count?: number; ScannedCount?: number; LastEvaluatedKey?: Key; ConsumedCapacity?: ConsumedCapacity }
  export type ReturnConsumedCapacity = 'INDEXES' | 'TOTAL' | 'NONE' | string
  export type ScanInput = QueryInput
  export type ScanOutput = QueryOutput
  export type ScanSegment = number
  export type ScanTotalSegments = number
  export type Select = 'ALL_ATTRIBUTES' | 'ALL_PROJECTED_ATTRIBUTES' | 'SPECIFIC_ATTRIBUTES' | 'COUNT' | string
  export interface StreamSpecification { StreamEnabled?: boolean; StreamViewType?: string }
  export type StringAttributeValue = string
  export type StringSetAttributeValue = string[]
  export interface TableDescription { AttributeDefinitions?: Types.AttributeDefinition[]; TableName?: string; KeySchema?: Types.KeySchemaElement[]; TableStatus?: string; CreationDateTime?: Date; ProvisionedThroughput?: Types.ProvisionedThroughput; TableSizeBytes?: number; ItemCount?: number; TableArn?: string; LocalSecondaryIndexes?: LocalSecondaryIndex[]; GlobalSecondaryIndexes?: GlobalSecondaryIndexDescriptionList; StreamSpecification?: StreamSpecification; LatestStreamLabel?: string; LatestStreamArn?: string; BillingModeSummary?: { BillingMode?: BillingMode } }
  export type TransactGetItemList = Array<{ Get: Get }>
  export interface TransactGetItemsInput { TransactItems: TransactGetItemList; ReturnConsumedCapacity?: ReturnConsumedCapacity }
  export interface TransactGetItemsOutput { Responses?: Array<{ Item?: AttributeMap }>; ConsumedCapacity?: ConsumedCapacity[] }
  export interface TransactWriteItem { ConditionCheck?: { Key: Key; TableName: string; ConditionExpression: string; ExpressionAttributeNames?: ExpressionAttributeNameMap; ExpressionAttributeValues?: ExpressionAttributeValueMap }; Delete?: Delete; Put?: Put; Update?: { Key: Key; TableName: string; UpdateExpression?: string; ConditionExpression?: string; ExpressionAttributeNames?: ExpressionAttributeNameMap; ExpressionAttributeValues?: ExpressionAttributeValueMap } }
  export type TransactWriteItemList = TransactWriteItem[]
  export interface TransactWriteItemsInput { TransactItems: TransactWriteItemList; ReturnConsumedCapacity?: ReturnConsumedCapacity }
  export interface TransactWriteItemsOutput { [key: string]: unknown }
  export interface UpdateContinuousBackupsInput { TableName: string; PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: boolean } }
  export interface UpdateContinuousBackupsOutput { [key: string]: unknown }
  export interface UpdateItemInput { TableName: string; Key: Key; UpdateExpression?: string; ConditionExpression?: string; ExpressionAttributeNames?: ExpressionAttributeNameMap; ExpressionAttributeValues?: ExpressionAttributeValueMap; ReturnConsumedCapacity?: ReturnConsumedCapacity; ReturnValues?: Types.ReturnValue }
  export interface UpdateItemOutput { Attributes?: AttributeMap }
  export interface UpdateTableInput { TableName?: string; AttributeDefinitions?: Types.AttributeDefinition[]; GlobalSecondaryIndexUpdates?: GlobalSecondaryIndexUpdate[] }
  export interface UpdateTableOutput { TableDescription?: TableDescription }
  export interface UpdateTimeToLiveInput { TableName: string; TimeToLiveSpecification: { Enabled: boolean; AttributeName: string } }
  export interface UpdateTimeToLiveOutput { [key: string]: unknown }
  export interface WriteRequest { PutRequest?: PutRequest; DeleteRequest?: DeleteRequest }

  export namespace Types {
    export interface AttributeDefinition { AttributeName?: string; AttributeType?: string }
    export type AttributeName = string
    export type AttributeValue = DynamoDB.AttributeValue
    export type BillingMode = DynamoDB.BillingMode
    export type ConsumedCapacity = DynamoDB.ConsumedCapacity
    export type CreateGlobalSecondaryIndexAction = DynamoDB.CreateGlobalSecondaryIndexAction
    export type DeleteItemOutput = DynamoDB.DeleteItemOutput
    export type GlobalSecondaryIndex = DynamoDB.GlobalSecondaryIndex
    export interface KeySchemaElement { AttributeName?: string; KeyType?: string }
    export type LocalSecondaryIndex = DynamoDB.LocalSecondaryIndex
    export interface Projection { ProjectionType?: string; NonKeyAttributes?: string[] }
    export interface ProvisionedThroughput { ReadCapacityUnits?: number; WriteCapacityUnits?: number }
    export type ReturnValue = 'NONE' | 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW' | string
    export type ScalarAttributeType = string
    export type StreamSpecification = DynamoDB.StreamSpecification
  }
}

export type AttributeValue = DynamoDB.AttributeValue
export type BatchWriteItemOutput = DynamoDB.BatchWriteItemOutput
export type BinarySetAttributeValue = DynamoDB.BinarySetAttributeValue
export type ItemList = DynamoDB.AttributeMap[]
