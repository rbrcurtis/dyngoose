"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentClient = exports.Attribute = exports.$Table = exports.$PrimaryKey = exports.$LocalSecondaryIndex = exports.$GlobalSecondaryIndex = exports.$DocumentClient = exports.$ = exports.Transaction = exports.Table = exports.QueryOutput = exports.Query = exports.Metadata = exports.Events = exports.Errors = exports.Decorator = exports.Connection = exports.Config = exports.BatchWrite = exports.BatchGet = exports.AttributeType = exports.TableOperations = void 0;
const batch_get_1 = require("./batch-get");
Object.defineProperty(exports, "BatchGet", { enumerable: true, get: function () { return batch_get_1.BatchGet; } });
const batch_write_1 = require("./batch-write");
Object.defineProperty(exports, "BatchWrite", { enumerable: true, get: function () { return batch_write_1.BatchWrite; } });
const Config = require("./config");
exports.Config = Config;
const Connection = require("./connections");
exports.Connection = Connection;
const Decorator = require("./decorator");
exports.Decorator = Decorator;
exports.$ = Decorator;
const Errors = require("./errors");
exports.Errors = Errors;
const Events = require("./events");
exports.Events = Events;
const Metadata = require("./metadata");
exports.Metadata = Metadata;
const Query = require("./query");
exports.Query = Query;
const table_1 = require("./table");
Object.defineProperty(exports, "Table", { enumerable: true, get: function () { return table_1.Table; } });
const attribute_type_1 = require("./tables/attribute-type");
Object.defineProperty(exports, "AttributeType", { enumerable: true, get: function () { return attribute_type_1.AttributeType; } });
const create_table_1 = require("./tables/create-table");
const delete_table_1 = require("./tables/delete-table");
const transaction_1 = require("./transaction");
Object.defineProperty(exports, "Transaction", { enumerable: true, get: function () { return transaction_1.Transaction; } });
const output_1 = require("./query/output");
Object.defineProperty(exports, "QueryOutput", { enumerable: true, get: function () { return output_1.QueryOutput; } });
exports.TableOperations = {
    createTable: async (table) => await (0, create_table_1.createTable)(table.schema),
    deleteTable: async (table) => await (0, delete_table_1.deleteTable)(table.schema),
};
var document_client_1 = require("./decorator/document-client");
Object.defineProperty(exports, "$DocumentClient", { enumerable: true, get: function () { return document_client_1.DocumentClient; } });
var global_secondary_index_1 = require("./decorator/global-secondary-index");
Object.defineProperty(exports, "$GlobalSecondaryIndex", { enumerable: true, get: function () { return global_secondary_index_1.GlobalSecondaryIndex; } });
var local_secondary_index_1 = require("./decorator/local-secondary-index");
Object.defineProperty(exports, "$LocalSecondaryIndex", { enumerable: true, get: function () { return local_secondary_index_1.LocalSecondaryIndex; } });
var primary_key_1 = require("./decorator/primary-key");
Object.defineProperty(exports, "$PrimaryKey", { enumerable: true, get: function () { return primary_key_1.PrimaryKey; } });
var table_2 = require("./decorator/table");
Object.defineProperty(exports, "$Table", { enumerable: true, get: function () { return table_2.Table; } });
var decorator_1 = require("./decorator");
Object.defineProperty(exports, "Attribute", { enumerable: true, get: function () { return decorator_1.Attribute; } });
var document_client_2 = require("./document-client");
Object.defineProperty(exports, "DocumentClient", { enumerable: true, get: function () { return document_client_2.DocumentClient; } });
//# sourceMappingURL=dyngoose.js.map