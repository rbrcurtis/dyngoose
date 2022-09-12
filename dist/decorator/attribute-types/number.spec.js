"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const setup_tests_spec_1 = require("../../setup-tests.spec");
describe('AttributeType/Number', () => {
    let record;
    beforeEach(() => {
        record = new setup_tests_spec_1.TestableTable();
    });
    it('should store values as numbers', () => {
        (0, chai_1.expect)(record.testNumber).eq(null);
        record.testNumber = 10;
        (0, chai_1.expect)(record.testNumber).eq(10);
        (0, chai_1.expect)(record.get('testNumber')).eq(10);
        (0, chai_1.expect)(record.getAttribute('testNumber')).eq(10);
        (0, chai_1.expect)(record.getAttributeDynamoValue('testNumber')).deep.eq({ N: '10' });
    });
    it('supports BigInt values', () => {
        const int = BigInt('9007199254740991');
        (0, chai_1.expect)(record.testBigInt).eq(null);
        record.testBigInt = int;
        (0, chai_1.expect)(record.testBigInt).to.eq(Number(int), 'read from record');
        (0, chai_1.expect)(record.get('testBigInt')).eq(Number(int), 'use .get');
        (0, chai_1.expect)(record.getAttribute('testBigInt')).eq(Number(int), 'use .getAttribute');
        (0, chai_1.expect)(record.getAttributeDynamoValue('testBigInt')).deep.eq({ N: int.toString() }, 'use .getAttributeDynamoValue');
    });
    it('rejects non-number values', () => {
        (0, chai_1.expect)(record.testNumber).eq(null);
        (0, chai_1.expect)(record.testString).eq(null);
        // we do this primarily to ensure typing is enforced for queries
        (0, chai_1.expect)(() => { record.testNumber = 'test'; }).to.throw();
    });
});
//# sourceMappingURL=number.spec.js.map