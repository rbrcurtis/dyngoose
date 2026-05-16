"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDB = void 0;
/* eslint-disable @typescript-eslint/no-namespace */
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
function isAttr(value) {
    return value != null && typeof value === 'object' && ('S' in value || 'N' in value || 'B' in value || 'SS' in value || 'NS' in value ||
        'BS' in value || 'M' in value || 'L' in value || 'NULL' in value || 'BOOL' in value);
}
function normalizeValue(value) {
    if (value.S === '')
        return { NULL: true };
    if (value.B instanceof Uint8Array && value.B.length === 0)
        return { NULL: true };
    if (value.SS != null && value.SS.length === 0)
        return null;
    if (value.NS != null && value.NS.length === 0)
        return null;
    if (value.BS != null && value.BS.length === 0)
        return null;
    return value;
}
function normalizeMap(map) {
    const normalized = {};
    for (const key of Object.keys(map)) {
        const value = normalizeValue(map[key]);
        if (value != null)
            normalized[key] = value;
    }
    return normalized;
}
function normalizeInput(input) {
    if (Array.isArray(input))
        return input.map(normalizeInput);
    if (isAttr(input))
        return normalizeValue(input);
    if (input != null && typeof input === 'object') {
        const normalized = {};
        for (const key of Object.keys(input)) {
            const value = normalizeInput(input[key]);
            if (value != null)
                normalized[key] = value;
        }
        return normalized;
    }
    return input;
}
function normalizeOutput(output) {
    if (output != null && typeof output === 'object' && 'Attributes' in output) {
        const record = output;
        if (record.Attributes != null)
            record.Attributes = normalizeMap(record.Attributes);
    }
    if (output != null && typeof output === 'object' && 'Item' in output) {
        const record = output;
        if (record.Item != null)
            record.Item = normalizeMap(record.Item);
    }
    if (output != null && typeof output === 'object' && 'Items' in output) {
        const record = output;
        if (record.Items != null)
            record.Items = record.Items.map(normalizeMap);
    }
    if (output != null && typeof output === 'object' && 'Responses' in output) {
        const record = output;
        if (Array.isArray(record.Responses)) {
            for (const item of record.Responses)
                if (item.Item != null)
                    item.Item = normalizeMap(item.Item);
        }
        else if (record.Responses != null) {
            for (const key of Object.keys(record.Responses))
                record.Responses[key] = record.Responses[key].map(normalizeMap);
        }
    }
    return output;
}
class Request {
    constructor(send) {
        this.send = send;
        this.listeners = [];
    }
    on(event, listener) {
        this.listeners.push({ event, listener });
        return this;
    }
    async promise() {
        var _a;
        try {
            return await this.send();
        }
        catch (err) {
            const error = err;
            (_a = error.cancellationReasons) !== null && _a !== void 0 ? _a : (error.cancellationReasons = error.CancellationReasons);
            for (const item of this.listeners) {
                if (item.event === 'extractError')
                    item.listener({ error });
            }
            throw error;
        }
    }
}
class DynamoDB {
    constructor(config = {}, client) {
        const { accessKeyId, secretAccessKey, ...clientConfig } = config;
        if (accessKeyId != null && secretAccessKey != null)
            clientConfig.credentials = { accessKeyId, secretAccessKey };
        this.client = client == null ? new client_dynamodb_1.DynamoDBClient(clientConfig) : client;
    }
    putItem(input) {
        return new Request(async () => normalizeOutput(await this.client.send(new client_dynamodb_1.PutItemCommand(normalizeInput(input)))));
    }
    updateItem(input) {
        return new Request(async () => normalizeOutput(await this.client.send(new client_dynamodb_1.UpdateItemCommand(normalizeInput(input)))));
    }
    deleteItem(input) {
        return new Request(async () => normalizeOutput(await this.client.send(new client_dynamodb_1.DeleteItemCommand(normalizeInput(input)))));
    }
    getItem(input) {
        return new Request(async () => normalizeOutput(await this.client.send(new client_dynamodb_1.GetItemCommand(normalizeInput(input)))));
    }
    batchWriteItem(input) {
        return new Request(async () => normalizeOutput(await this.client.send(new client_dynamodb_1.BatchWriteItemCommand(normalizeInput(input)))));
    }
    batchGetItem(input) {
        return new Request(async () => normalizeOutput(await this.client.send(new client_dynamodb_1.BatchGetItemCommand(normalizeInput(input)))));
    }
    transactWriteItems(input) {
        return new Request(async () => await this.client.send(new client_dynamodb_1.TransactWriteItemsCommand(normalizeInput(input))));
    }
    transactGetItems(input) {
        return new Request(async () => normalizeOutput(await this.client.send(new client_dynamodb_1.TransactGetItemsCommand(normalizeInput(input)))));
    }
    query(input) {
        return new Request(async () => normalizeOutput(await this.client.send(new client_dynamodb_1.QueryCommand(normalizeInput(input)))));
    }
    scan(input) {
        return new Request(async () => normalizeOutput(await this.client.send(new client_dynamodb_1.ScanCommand(normalizeInput(input)))));
    }
    createTable(input) {
        return new Request(async () => await this.client.send(new client_dynamodb_1.CreateTableCommand(input)));
    }
    updateTable(input) {
        return new Request(async () => await this.client.send(new client_dynamodb_1.UpdateTableCommand(input)));
    }
    deleteTable(input) {
        return new Request(async () => await this.client.send(new client_dynamodb_1.DeleteTableCommand(input)));
    }
    describeTable(input) {
        return new Request(async () => await this.client.send(new client_dynamodb_1.DescribeTableCommand(input)));
    }
    describeTimeToLive(input) {
        return new Request(async () => await this.client.send(new client_dynamodb_1.DescribeTimeToLiveCommand(input)));
    }
    updateTimeToLive(input) {
        return new Request(async () => await this.client.send(new client_dynamodb_1.UpdateTimeToLiveCommand(input)));
    }
    updateContinuousBackups(input) {
        return new Request(async () => await this.client.send(new client_dynamodb_1.UpdateContinuousBackupsCommand(input)));
    }
    describeContinuousBackups(input) {
        return new Request(async () => await this.client.send(new client_dynamodb_1.DescribeContinuousBackupsCommand(input)));
    }
    waitFor(state, input) {
        return new Request(async () => { await (0, client_dynamodb_1.waitUntilTableExists)({ client: this.client, maxWaitTime: 300 }, input); });
    }
}
exports.DynamoDB = DynamoDB;
//# sourceMappingURL=dynamodb.js.map