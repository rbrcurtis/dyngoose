"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBConnection = void 0;
const node_http_handler_1 = require("@smithy/node-http-handler");
const http_1 = require("http");
const https_1 = require("https");
const dynamodb_1 = require("../dynamodb");
class DynamoDBConnection {
    constructor(options) {
        const { enableAWSXray: _, ...config } = options;
        const httpAgent = this.httpAgent(typeof options.endpoint === 'string' ? options.endpoint : undefined);
        config.requestHandler = new node_http_handler_1.NodeHttpHandler({
            httpAgent: httpAgent instanceof http_1.Agent ? httpAgent : undefined,
            httpsAgent: httpAgent instanceof https_1.Agent ? httpAgent : undefined,
        });
        this.__client = new dynamodb_1.DynamoDB(config);
    }
    httpAgent(endpoint) {
        if (typeof endpoint === 'string' && endpoint.startsWith('http://')) {
            return new http_1.Agent({
                keepAlive: true,
            });
        }
        else {
            return new https_1.Agent({
                rejectUnauthorized: true,
                keepAlive: true,
            });
        }
    }
    get client() {
        return this.__client;
    }
}
exports.DynamoDBConnection = DynamoDBConnection;
//# sourceMappingURL=dynamodb-connection.js.map