"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringSetAttributeType = void 0;
const lodash_1 = require("lodash");
const errors_1 = require("../../errors");
const attribute_type_1 = require("../../tables/attribute-type");
class StringSetAttributeType extends attribute_type_1.AttributeType {
    constructor() {
        super(...arguments);
        this.type = "SS" /* DynamoAttributeType.StringSet */;
    }
    toDynamo(values) {
        if (!Array.isArray(values) || !(0, lodash_1.every)(values, lodash_1.isString)) {
            throw new errors_1.ValidationError(`Expected ${this.propertyName} to be an array of strings, got ${String(values)}`);
        }
        // dynamodb does not allow sets to contain duplicate values, so ensure uniqueness here
        return {
            SS: (0, lodash_1.uniq)(values.map((value) => String(value))),
        };
    }
}
exports.StringSetAttributeType = StringSetAttributeType;
//# sourceMappingURL=string-set.js.map