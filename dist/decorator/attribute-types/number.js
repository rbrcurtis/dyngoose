"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberAttributeType = void 0;
const errors_1 = require("../../errors");
const attribute_type_1 = require("../../tables/attribute-type");
const utils_1 = require("./utils");
class NumberAttributeType extends attribute_type_1.AttributeType {
    constructor() {
        super(...arguments);
        this.type = "N" /* DynamoAttributeType.Number */;
    }
    toDynamo(value) {
        value = Number(value);
        if (!(0, utils_1.isNumber)(value) || isNaN(value)) {
            throw new errors_1.ValidationError(`Expected ${this.propertyName} to be a number`);
        }
        return {
            N: (0, utils_1.numberToString)(value),
        };
    }
    fromDynamo(value) {
        if (value.N == null) {
            return null;
        }
        else {
            return (0, utils_1.stringToNumber)(value.N);
        }
    }
}
exports.NumberAttributeType = NumberAttributeType;
//# sourceMappingURL=number.js.map