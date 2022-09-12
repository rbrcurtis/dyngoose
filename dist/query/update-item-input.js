"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpdateItemInput = void 0;
const _ = require("lodash");
const expression_1 = require("./expression");
function getUpdateItemInput(record, params) {
    var _a;
    const tableClass = record.constructor;
    const input = {
        TableName: tableClass.schema.name,
        Key: record.getDynamoKey(),
        ReturnValues: (_a = params === null || params === void 0 ? void 0 : params.returnValues) !== null && _a !== void 0 ? _a : 'NONE',
    };
    if ((params === null || params === void 0 ? void 0 : params.returnConsumedCapacity) != null) {
        input.ReturnConsumedCapacity = params.returnConsumedCapacity;
    }
    const sets = [];
    const removes = [];
    const attributeNameMap = {};
    const attributeValueMap = {};
    let valueCounter = 0;
    // we call toDynamo to have the record self-check for any dynamic attributes
    record.toDynamo();
    _.each(_.uniq(record.getUpdatedAttributes()), (attributeName, i) => {
        const attribute = tableClass.schema.getAttributeByName(attributeName);
        const value = attribute.toDynamo(record.getAttribute(attributeName));
        const operator = record.getUpdateOperator(attributeName);
        const slug = `#UA${valueCounter}`;
        if (value != null) {
            attributeNameMap[slug] = attributeName;
            attributeValueMap[`:u${valueCounter}`] = value;
            switch (operator) {
                // Number attribute operators
                case 'increment':
                    sets.push(`${slug} = ${slug} + :u${valueCounter}`);
                    break;
                case 'decrement':
                    sets.push(`${slug} = ${slug} - :u${valueCounter}`);
                    break;
                // List attribute operators
                case 'append':
                    sets.push(`${slug} = list_append(${slug}, :u${valueCounter})`);
                    break;
                case 'if_not_exists':
                    sets.push(`${slug} = if_not_exists(${slug}, :u${valueCounter})`);
                    break;
                case 'set':
                default:
                    sets.push(`${slug} = :u${valueCounter}`);
                    break;
            }
            valueCounter++;
        }
    });
    _.each(_.uniq(record.getDeletedAttributes()), (attrName, i) => {
        const slug = `#DA${valueCounter}`;
        attributeNameMap[slug] = attrName;
        removes.push(slug);
        valueCounter++;
    });
    let updateExpression = '';
    if (sets.length > 0) {
        updateExpression += 'SET ' + sets.join(', ');
    }
    if (removes.length > 0) {
        if (updateExpression.length > 0) {
            updateExpression += ' ';
        }
        updateExpression += 'REMOVE ' + removes.join(', ');
    }
    if ((params === null || params === void 0 ? void 0 : params.conditions) != null) {
        const conditionExpression = (0, expression_1.buildQueryExpression)(tableClass.schema, params.conditions);
        input.ConditionExpression = conditionExpression.FilterExpression;
        Object.assign(attributeNameMap, conditionExpression.ExpressionAttributeNames);
        Object.assign(attributeValueMap, conditionExpression.ExpressionAttributeValues);
    }
    input.ExpressionAttributeNames = attributeNameMap;
    input.UpdateExpression = updateExpression;
    if (_.size(attributeValueMap) > 0) {
        input.ExpressionAttributeValues = attributeValueMap;
    }
    return input;
}
exports.getUpdateItemInput = getUpdateItemInput;
//# sourceMappingURL=update-item-input.js.map