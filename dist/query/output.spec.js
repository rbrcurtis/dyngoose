"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const setup_tests_spec_1 = require("../setup-tests.spec");
const output_1 = require("./output");
describe('Query/Output', () => {
    const emptyItems = [];
    const someItems = [
        {},
        {},
    ];
    it('should create a native array-like object', async () => {
        const output = output_1.QueryOutput.fromDynamoOutput(setup_tests_spec_1.TestableTable, {
            Count: someItems.length,
            Items: someItems,
        }, false);
        chai_1.expect(output.count).to.eq(someItems.length);
        chai_1.expect(output.length).to.eq(someItems.length);
        chai_1.expect(output[0]).to.not.be.eq(undefined);
        chai_1.expect(output.map(i => i)[0]).to.be.instanceOf(setup_tests_spec_1.TestableTable);
        for (const item of output) {
            chai_1.expect(item).to.be.instanceOf(setup_tests_spec_1.TestableTable);
        }
    });
    it('should merge several outputs into a combined output', async () => {
        const output1 = output_1.QueryOutput.fromDynamoOutput(setup_tests_spec_1.TestableTable, {
            Count: someItems.length,
            Items: someItems,
        }, false);
        const output2 = output_1.QueryOutput.fromDynamoOutput(setup_tests_spec_1.TestableTable, {
            Count: someItems.length,
            Items: someItems,
        }, false);
        const output = output_1.QueryOutput.fromSeveralOutputs(setup_tests_spec_1.TestableTable, [
            output1,
            output2,
        ]);
        chai_1.expect(output.count).to.eq(someItems.length * 2);
        chai_1.expect(output.length).to.eq(someItems.length * 2);
        chai_1.expect(output[0]).to.not.eq(undefined);
        chai_1.expect(output.map(i => i)[0]).to.be.instanceOf(setup_tests_spec_1.TestableTable);
        for (const item of output) {
            chai_1.expect(item).to.be.instanceOf(setup_tests_spec_1.TestableTable);
        }
    });
    it('should ignore possible null items', async () => {
        // this is a bit of overkill to help resolve #482
        const output = output_1.QueryOutput.fromDynamoOutput(setup_tests_spec_1.TestableTable, {
            Count: 0,
            Items: [null],
        }, false);
        chai_1.expect(output.count).to.eq(0);
        chai_1.expect(output.length).to.eq(0);
        chai_1.expect(output[0]).to.eq(undefined);
        chai_1.expect(output.map(i => i)[0]).to.eq(undefined);
        for (const item of output) {
            chai_1.expect(item).to.eq(undefined);
        }
    });
    it('should return an empty array when there are no items', async () => {
        const output = output_1.QueryOutput.fromDynamoOutput(setup_tests_spec_1.TestableTable, {
            Count: 0,
            Items: emptyItems,
            ScannedCount: 1000,
            LastEvaluatedKey: {},
            ConsumedCapacity: {},
        }, false);
        chai_1.expect(output.count).to.eq(0);
        chai_1.expect(output.length).to.eq(0);
        chai_1.expect(output[0]).to.eq(undefined);
        chai_1.expect(output.map(i => i)[0]).to.eq(undefined);
        for (const item of output) {
            chai_1.expect(item).to.eq(undefined);
        }
    });
    it('should merge several empty outputs into a single combined empty output', async () => {
        const output1 = output_1.QueryOutput.fromDynamoOutput(setup_tests_spec_1.TestableTable, {
            Count: 0,
            Items: emptyItems,
        }, false);
        const output2 = output_1.QueryOutput.fromDynamoOutput(setup_tests_spec_1.TestableTable, {
            Count: 0,
            Items: emptyItems,
        }, false);
        const output = output_1.QueryOutput.fromSeveralOutputs(setup_tests_spec_1.TestableTable, [
            output1,
            output2,
        ]);
        chai_1.expect(output.count).to.eq(0);
        chai_1.expect(output.length).to.eq(0);
        chai_1.expect(output[0]).to.eq(undefined);
        chai_1.expect(output.map(i => i)[0]).to.eq(undefined);
        for (const item of output) {
            chai_1.expect(item).to.eq(undefined);
        }
    });
});
//# sourceMappingURL=output.spec.js.map