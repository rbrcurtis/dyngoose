"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateAttributeType = void 0;
const errors_1 = require("../../errors");
const attribute_type_1 = require("../../tables/attribute-type");
const utils_1 = require("./utils");
const DateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const ISOPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
class DateAttributeType extends attribute_type_1.AttributeType {
    constructor(record, propertyName, metadata) {
        var _a, _b, _c;
        super(record, propertyName, metadata);
        this.type = "S" /* DynamoAttributeType.String */;
        if (((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.unixTimestamp) === true ||
            ((_b = this.metadata) === null || _b === void 0 ? void 0 : _b.millisecondTimestamp) === true ||
            ((_c = this.metadata) === null || _c === void 0 ? void 0 : _c.timeToLive) === true) {
            this.type = "N" /* DynamoAttributeType.Number */;
        }
    }
    decorate() {
        var _a;
        super.decorate();
        if (((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.timeToLive) === true) {
            if (this.schema.timeToLiveAttribute != null) {
                throw new errors_1.SchemaError(`Table ${this.schema.name} has two timeToLive attributes defined`);
            }
            else {
                this.schema.timeToLiveAttribute = this.attribute;
            }
        }
    }
    getDefault() {
        var _a, _b;
        if (((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.nowOnCreate) === true || ((_b = this.metadata) === null || _b === void 0 ? void 0 : _b.nowOnUpdate) === true) {
            return new Date();
        }
        return null;
    }
    toDynamo(dt) {
        var _a, _b, _c, _d;
        if (((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.nowOnUpdate) === true) {
            dt = new Date();
        }
        if (((_b = this.metadata) === null || _b === void 0 ? void 0 : _b.unixTimestamp) === true ||
            ((_c = this.metadata) === null || _c === void 0 ? void 0 : _c.millisecondTimestamp) === true ||
            ((_d = this.metadata) === null || _d === void 0 ? void 0 : _d.timeToLive) === true) {
            return {
                N: this.parseDate(dt).toString(),
            };
        }
        else {
            return {
                S: this.parseDate(dt).toString(),
            };
        }
    }
    fromDynamo(attributeValue) {
        var _a, _b, _c;
        // whenever the value is stored as a number, it must be a timestamp
        // the timestamp will have been stored in UTC
        if (attributeValue.N != null) {
            if (((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.millisecondTimestamp) === true) {
                return new Date((0, utils_1.stringToNumber)(attributeValue.N));
            }
            else if (((_b = this.metadata) === null || _b === void 0 ? void 0 : _b.unixTimestamp) === true || ((_c = this.metadata) === null || _c === void 0 ? void 0 : _c.timeToLive) === true) {
                return new Date((0, utils_1.stringToNumber)(attributeValue.N) * 1000);
            }
            else {
                return null;
            }
        }
        else if (attributeValue.S != null) {
            return new Date(attributeValue.S);
        }
        else {
            return null;
        }
    }
    fromJSON(dt) {
        var _a, _b, _c;
        if (((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.unixTimestamp) === true || ((_b = this.metadata) === null || _b === void 0 ? void 0 : _b.timeToLive) === true) {
            return new Date((0, utils_1.stringToNumber)(dt) * 1000);
        }
        else if (((_c = this.metadata) === null || _c === void 0 ? void 0 : _c.millisecondTimestamp) === true) {
            return new Date((0, utils_1.stringToNumber)(dt));
        }
        else {
            return new Date(dt);
        }
    }
    toJSON(dt) {
        var _a, _b, _c, _d, _e, _f;
        if (!(dt instanceof Date)) {
            dt = new Date(dt);
        }
        if (isNaN(dt.getTime())) {
            return ((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.unixTimestamp) === true || ((_b = this.metadata) === null || _b === void 0 ? void 0 : _b.timeToLive) === true ? -1 : 'NaN';
        }
        if (((_c = this.metadata) === null || _c === void 0 ? void 0 : _c.unixTimestamp) === true || ((_d = this.metadata) === null || _d === void 0 ? void 0 : _d.timeToLive) === true) {
            // the Math.floor gets rid of the decimal places, which would corrupt the value when being saved
            return Math.floor(dt.valueOf() / 1000);
        }
        else if (((_e = this.metadata) === null || _e === void 0 ? void 0 : _e.millisecondTimestamp) === true) {
            return dt.valueOf();
        }
        else if (((_f = this.metadata) === null || _f === void 0 ? void 0 : _f.dateOnly) === true) {
            // grab the ISO string, then split at the time (T) separator and grab only the date
            return dt.toISOString().split('T')[0];
        }
        else {
            try {
                return dt.toISOString();
            }
            catch (err) {
                console.error('what is this?', dt);
                throw err;
            }
        }
    }
    parseDate(dt) {
        var _a, _b, _c, _d, _e, _f, _g;
        // support ISO formatted date strings
        if (typeof dt === 'string') {
            // if date only, support YYYY-MM-DD
            if (((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.dateOnly) === true && DateOnlyPattern.test(dt)) {
                // parse YYYY-MM-DD and ensure we create the Date object in UTC
                const b = dt.split('-').map((d) => parseInt(d, 10));
                dt = new Date(Date.UTC(b[0], --b[1], b[2]));
                // if timestamp, assume the value is a timestamp
            }
            else if (((_b = this.metadata) === null || _b === void 0 ? void 0 : _b.unixTimestamp) === true || ((_c = this.metadata) === null || _c === void 0 ? void 0 : _c.timeToLive) === true) {
                dt = new Date((0, utils_1.stringToNumber)(dt) * 1000);
            }
            else if (((_d = this.metadata) === null || _d === void 0 ? void 0 : _d.millisecondTimestamp) === true) {
                dt = new Date((0, utils_1.stringToNumber)(dt));
            }
            else if (ISOPattern.test(dt)) {
                dt = new Date(dt);
            }
        }
        else if (typeof dt === 'number') {
            if (((_e = this.metadata) === null || _e === void 0 ? void 0 : _e.unixTimestamp) === true || ((_f = this.metadata) === null || _f === void 0 ? void 0 : _f.timeToLive) === true) {
                dt = new Date(dt * 1000);
            }
            else if (((_g = this.metadata) === null || _g === void 0 ? void 0 : _g.millisecondTimestamp) === true) {
                dt = new Date(dt);
            }
        }
        return this.toJSON(dt);
    }
}
exports.DateAttributeType = DateAttributeType;
//# sourceMappingURL=date.js.map