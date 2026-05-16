"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dynamodb_1 = require("../dynamodb");
const chai_1 = require("chai");
const dynamodb_connection_1 = require("./dynamodb-connection");
describe(dynamodb_connection_1.DynamoDBConnection.name, () => {
    describe('#constructor', () => {
        it('should work', () => {
            const conn = new dynamodb_connection_1.DynamoDBConnection({ endpoint: undefined, enableAWSXray: false });
            (0, chai_1.expect)(conn).to.be.instanceof(dynamodb_connection_1.DynamoDBConnection);
        });
    });
    describe('#client', () => {
        it('should return client', () => {
            const conn = new dynamodb_connection_1.DynamoDBConnection({ endpoint: undefined, enableAWSXray: false });
            (0, chai_1.expect)(conn.client).to.be.instanceof(dynamodb_1.DynamoDB);
        });
    });
});
//# sourceMappingURL=dynamodb-connection.spec.js.map