"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Dyngoose = require(".");
const setup_tests_spec_1 = require("./setup-tests.spec");
describe('Table', () => {
    it('should create primaryKey', () => {
        (0, chai_1.expect)(setup_tests_spec_1.TestableTable.primaryKey).to.be.instanceof(Dyngoose.Query.PrimaryKey);
    });
    it('should have attributes properties', async () => {
        const card = new setup_tests_spec_1.TestableTable();
        card.id = 10;
        card.title = '100';
        await card.save();
        const reloadedCard = await setup_tests_spec_1.TestableTable.primaryKey.get(10, '100');
        (0, chai_1.expect)(reloadedCard).to.be.instanceof(setup_tests_spec_1.TestableTable);
        if (reloadedCard != null) {
            (0, chai_1.expect)(reloadedCard.id).to.eq(10);
            (0, chai_1.expect)(reloadedCard.get('id')).to.eq(10);
            (0, chai_1.expect)(reloadedCard.title).to.eq('100');
        }
    });
    describe('.remove', () => {
        it('should allow attributes to be removed', async () => {
            const card = setup_tests_spec_1.TestableTable.new();
            card.id = 101;
            card.title = '101';
            card.generic = 'something';
            card.remove('generic');
            card.remove('testString');
            card.testString = 'value is set';
            await card.save();
            const reloadedCard = await setup_tests_spec_1.TestableTable.primaryKey.get(101, '101');
            (0, chai_1.expect)(reloadedCard).to.be.instanceof(setup_tests_spec_1.TestableTable);
            if (reloadedCard != null) {
                (0, chai_1.expect)(reloadedCard.id).to.eq(101);
                (0, chai_1.expect)(reloadedCard.get('id')).to.eq(101);
                (0, chai_1.expect)(reloadedCard.title).to.eq('101');
                (0, chai_1.expect)(reloadedCard.generic).to.eq(null);
                (0, chai_1.expect)(reloadedCard.defaultedString).to.eq('SomeDefault');
                (0, chai_1.expect)(reloadedCard.testString).to.eq('value is set');
            }
        });
    });
    describe('.updateSet', () => {
        it('should update a set', async () => {
            const card = setup_tests_spec_1.TestableTable.new({
                id: 98,
                title: '98',
                testStringSet: [
                    '',
                    'test',
                    'strings',
                ],
                testNumberSet: [
                    1,
                    2,
                    3,
                ],
            });
            (0, chai_1.expect)(card.testStringSet).to.deep.eq(['', 'test', 'strings']);
            (0, chai_1.expect)(card.testNumberSet).to.deep.eq([1, 2, 3]);
            card.updateSet('testStringSet', ['', 'test', 'test', 'abc']);
            (0, chai_1.expect)(card.testStringSet).to.deep.eq(['test', 'abc'], 'set was cleaned by updateSet');
            card.updateSet('testStringSet', ['abc', 'test']);
            card.updateSet('testNumberSet', [3, 2, 1]);
            (0, chai_1.expect)(card.testStringSet).to.deep.eq(['test', 'abc'], 'set should not have been changed');
            (0, chai_1.expect)(card.testNumberSet).to.deep.eq([1, 2, 3], 'set should not have been changed');
            card.updateSet('testStringSet', ['abc']);
            (0, chai_1.expect)(card.testStringSet).to.deep.eq(['abc'], 'test should have been removed from testStringSet');
        });
    });
    it('should support update operators', async () => {
        const card = setup_tests_spec_1.TestableTable.new({
            id: 98,
            title: '98',
            testString: 'some value',
            testNumber: 11,
            testNumberSet: [1, 2, 3],
            testAttributeNaming: 'test',
        });
        await card.save();
        (0, chai_1.expect)(card.testNumber).to.eq(11, 'num eq 11');
        card.set('testNumber', 5, { operator: 'decrement' });
        await card.save();
        const reloadedCard = await setup_tests_spec_1.TestableTable.primaryKey.get(card);
        (0, chai_1.expect)(reloadedCard).to.be.instanceof(setup_tests_spec_1.TestableTable);
        if (reloadedCard != null) {
            (0, chai_1.expect)(reloadedCard.testNumber).to.eq(11 - 5, 'decrement worked');
        }
    });
    it('should allow an attribute to be emptied', async () => {
        const card = new setup_tests_spec_1.TestableTable();
        card.id = 10;
        card.title = '100';
        card.testString = 'some value';
        await card.save();
        (0, chai_1.expect)(card.testString).to.eq('some value', 'initial card created');
        card.testString = '';
        (0, chai_1.expect)(card.testString).to.eq(null, 'cleared strings become null, because DynamoDB does not allow empty string values');
        await card.save();
        const reloadedCard = await setup_tests_spec_1.TestableTable.primaryKey.get(10, '100');
        (0, chai_1.expect)(reloadedCard).to.be.instanceof(setup_tests_spec_1.TestableTable);
        if (reloadedCard != null) {
            (0, chai_1.expect)(reloadedCard.testString).to.eq(null, 'reloaded testString value compared');
        }
    });
    it('should work with TTL', async () => {
        const card = new setup_tests_spec_1.TestableTable();
        card.id = 10;
        card.title = '100';
        card.expiresAt = new Date(Date.now() + 5000); // 5 secs away
        await card.save();
        // Wait 15 seconds
        await new Promise((resolve) => setTimeout(resolve, 15000));
        const reloaded = await setup_tests_spec_1.TestableTable.primaryKey.get(10, '100', { consistent: true });
        (0, chai_1.expect)(reloaded).to.eq(undefined);
    });
    it('should be able to query by property names', async () => {
        const results = await setup_tests_spec_1.TestableTable.primaryKey.scan({
            testAttributeNaming: 'test',
        });
        (0, chai_1.expect)(results.length).to.eq(1);
    });
    describe('saving should support conditions', () => {
        context('when condition check was failed', () => {
            it('should throw error', async () => {
                const record = setup_tests_spec_1.TestableTable.new({ id: 22, title: 'something new' });
                await record.save();
                let error;
                try {
                    record.generic = 'something blue';
                    await record.save({ conditions: { generic: 'fail' } });
                }
                catch (ex) {
                    error = ex;
                }
                (0, chai_1.expect)(error).to.be.instanceOf(Error)
                    .with.property('name', 'ConditionalCheckFailedException');
                (0, chai_1.expect)(error).to.have.property('message', 'The conditional request failed');
            });
        });
        context('when condition check was passed', () => {
            it('should put item as per provided condition', async () => {
                const record = setup_tests_spec_1.TestableTable.new({ id: 22, title: 'bar' });
                // save a new record, and confirm the id does not exist… useful to
                // confirm you are adding a new record and not unintentionally updating an existing one
                await record.save({ conditions: { id: ['not exists'] } });
                const reloaded = await setup_tests_spec_1.TestableTable.primaryKey.get({ id: 22, title: 'bar' }, { consistent: true });
                (0, chai_1.expect)(reloaded).to.be.instanceOf(setup_tests_spec_1.TestableTable);
            });
        });
    });
    describe('saving should support returnValue', () => {
        it('should parse the returned values', async () => {
            const newRecord = setup_tests_spec_1.TestableTable.new({
                id: 99,
                title: 'new record',
                generic: 'before update',
                unixTimestamp: new Date(),
            });
            await newRecord.save();
            // load the record we just created
            const record = await setup_tests_spec_1.TestableTable.primaryKey.fromKey({
                id: 99,
                title: 'new record',
            });
            record.generic = 'after update';
            const output = await record.save({ returnOutput: true, operator: 'update', returnValues: 'ALL_OLD' });
            (0, chai_1.expect)(output.Attributes).to.not.be.a('undefined');
            if (output.Attributes != null) {
                const oldRecord = setup_tests_spec_1.TestableTable.fromDynamo(output.Attributes);
                (0, chai_1.expect)(oldRecord.generic).to.eq('before update');
            }
        });
    });
    describe('deleting should support conditions', () => {
        context('when condition check was failed', () => {
            it('should throw error', async () => {
                const record = setup_tests_spec_1.TestableTable.new({ id: 23, title: 'something new' });
                await record.save();
                let error;
                try {
                    await record.delete({ conditions: { id: 24 } });
                }
                catch (ex) {
                    error = ex;
                }
                (0, chai_1.expect)(error).to.be.instanceOf(Error)
                    .with.property('name', 'ConditionalCheckFailedException');
                (0, chai_1.expect)(error).to.have.property('message', 'The conditional request failed');
            });
        });
        context('when condition check was passed', () => {
            it('should delete item as per provided condition', async () => {
                const record = setup_tests_spec_1.TestableTable.new({ id: 24, title: 'bar' });
                // save a new record, and confirm the id does not exist… useful to
                // confirm you are adding a new record and not unintentionally updating an existing one
                await record.save();
                await record.delete({ conditions: { id: 24 } });
                const reloaded = await setup_tests_spec_1.TestableTable.primaryKey.get(record, { consistent: true });
                (0, chai_1.expect)(reloaded).not.to.be.instanceOf(setup_tests_spec_1.TestableTable);
            });
        });
    });
    it('should apply default values', () => {
        const record = setup_tests_spec_1.TestableTable.new();
        (0, chai_1.expect)(record.id).to.eq(1);
        (0, chai_1.expect)(record.defaultedString).to.eq('SomeDefault');
        (0, chai_1.expect)(record.testNumberSetWithDefaults).to.deep.eq([42, 420]);
    });
    it('should not apply defaults when the record is loaded from DynamoDB', () => {
        const record = setup_tests_spec_1.TestableTable.fromDynamo({});
        (0, chai_1.expect)(record.id).to.eq(null);
    });
    describe('#toJSON', () => {
        it('should export to an object', () => {
            const record = setup_tests_spec_1.TestableTable.new();
            (0, chai_1.expect)(record.toJSON()).to.deep.eq({
                id: 1,
                defaultedString: 'SomeDefault',
                testNumberSetWithDefaults: [42, 420],
                createdAt: record.createdAt.toISOString(),
                updatedAt: record.updatedAt.toISOString(),
            });
        });
        it('should not apply defaults when the record is loaded from DynamoDB', () => {
            const record = setup_tests_spec_1.TestableTable.fromDynamo({});
            (0, chai_1.expect)(record.toJSON()).to.deep.eq({});
        });
    });
});
//# sourceMappingURL=table.spec.js.map