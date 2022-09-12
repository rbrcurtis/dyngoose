"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentClient = void 0;
const errors_1 = require("./errors");
const batch_write_1 = require("./query/batch-write");
const expression_1 = require("./query/expression");
const transact_write_1 = require("./query/transact-write");
const update_item_input_1 = require("./query/update-item-input");
class DocumentClient {
    constructor(tableClass) {
        this.tableClass = tableClass;
    }
    getPutInput(record, params) {
        const input = {
            TableName: this.tableClass.schema.name,
            Item: record.toDynamo(),
        };
        if ((params === null || params === void 0 ? void 0 : params.returnValues) != null) {
            input.ReturnValues = params.returnValues;
        }
        if ((params === null || params === void 0 ? void 0 : params.conditions) != null) {
            const conditionExpression = (0, expression_1.buildQueryExpression)(this.tableClass.schema, params.conditions);
            input.ConditionExpression = conditionExpression.FilterExpression;
            input.ExpressionAttributeNames = conditionExpression.ExpressionAttributeNames;
            input.ExpressionAttributeValues = conditionExpression.ExpressionAttributeValues;
        }
        return input;
    }
    async put(record, params) {
        const input = this.getPutInput(record, params);
        try {
            return await this.tableClass.schema.dynamo.putItem(input).promise();
        }
        catch (ex) {
            throw new errors_1.HelpfulError(ex, this.tableClass, input);
        }
    }
    getUpdateInput(record, params) {
        return (0, update_item_input_1.getUpdateItemInput)(record, params);
    }
    async update(record, params) {
        const input = this.getUpdateInput(record, params);
        try {
            return await this.tableClass.schema.dynamo.updateItem(input).promise();
        }
        catch (ex) {
            throw new errors_1.HelpfulError(ex, this.tableClass, input);
        }
    }
    async batchPut(records) {
        return await (0, batch_write_1.batchWrite)(this.tableClass.schema.dynamo, records.map((record) => {
            const request = {
                [this.tableClass.schema.name]: [
                    {
                        PutRequest: {
                            Item: record.toDynamo(),
                        },
                    },
                ],
            };
            return request;
        }));
    }
    getDeleteInput(record, conditions) {
        const input = {
            TableName: this.tableClass.schema.name,
            Key: record.getDynamoKey(),
        };
        if (conditions != null) {
            const conditionExpression = (0, expression_1.buildQueryExpression)(this.tableClass.schema, conditions);
            input.ConditionExpression = conditionExpression.FilterExpression;
            input.ExpressionAttributeNames = conditionExpression.ExpressionAttributeNames;
            input.ExpressionAttributeValues = conditionExpression.ExpressionAttributeValues;
        }
        return input;
    }
    async transactPut(records) {
        return await (0, transact_write_1.transactWrite)(this.tableClass.schema.dynamo, records.map((record) => {
            const writeRequest = {
                Put: {
                    TableName: this.tableClass.schema.name,
                    Item: record.toDynamo(),
                },
            };
            return writeRequest;
        }));
    }
    async delete(record, conditions) {
        const input = this.getDeleteInput(record, conditions);
        try {
            return await this.tableClass.schema.dynamo.deleteItem(input).promise();
        }
        catch (ex) {
            throw new errors_1.HelpfulError(ex, this.tableClass, input);
        }
    }
}
exports.DocumentClient = DocumentClient;
//# sourceMappingURL=document-client.js.map