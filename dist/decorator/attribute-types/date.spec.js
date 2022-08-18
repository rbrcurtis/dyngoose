"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const setup_tests_spec_1 = require("../../setup-tests.spec");
describe('AttributeType/Date', () => {
    let record;
    let now;
    beforeEach(() => {
        now = new Date();
        record = setup_tests_spec_1.TestableTable.new();
    });
    describe(':nowOnCreate', () => {
        it('should set date to now when creating a record', async () => {
            record.id = 40;
            record.title = 'date nowOnCreate test';
            await record.save();
            chai_1.expect(record.createdAt).to.be.a('date');
            chai_1.expect(record.toJSON().createdAt).to.be.a('string');
            chai_1.expect(record.createdAt).to.be.at.least(now);
            chai_1.expect(record.getAttributeDynamoValue('createdAt')).to.deep.eq({
                S: record.createdAt.toISOString(),
            });
        });
    });
    describe(':nowOnUpdate', () => {
        it('should set date to now when updating a record', async () => {
            record.id = 41;
            record.title = 'date nowOnUpdate test';
            await record.save();
            chai_1.expect(record.updatedAt).to.be.a('date');
            // wait 2 seconds
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const later = new Date();
            chai_1.expect(record.updatedAt).to.be.within(now, later);
            chai_1.expect(record.updatedAt).to.be.below(later);
            // wait 2 seconds
            await new Promise((resolve) => setTimeout(resolve, 2000));
            // save again
            await record.save({ force: true }); // using force save so it saves, ignoring the fact there are no changes
            chai_1.expect(record.updatedAt).to.be.a('date');
            chai_1.expect(record.updatedAt).to.be.at.least(later);
            chai_1.expect(record.updatedAt).to.be.at.within(later, new Date());
            chai_1.expect(record.getAttributeDynamoValue('createdAt')).to.deep.eq({
                S: record.createdAt.toISOString(),
            });
        });
    });
    describe(':unixTimestamp', () => {
        it('should store a date as a unix timestamp', async () => {
            const now = new Date();
            record.unixTimestamp = now;
            chai_1.expect(record.unixTimestamp).to.be.a('date');
            chai_1.expect(record.toJSON().unixTimestamp).to.be.a('number');
            // the unixTimestamp should have ben converted to a unix timestamp, so it should be slightly different from `now`
            chai_1.expect(record.unixTimestamp.valueOf()).to.not.eq(now.valueOf());
            // the js timestamp to unix timestamp conversion should work
            chai_1.expect(record.unixTimestamp.valueOf()).to.eq(Math.floor(now.valueOf() / 1000) * 1000);
            chai_1.expect(record.getAttributeDynamoValue('unixTimestamp')).to.deep.eq({
                N: Math.floor(now.valueOf() / 1000).toString(),
            });
        });
    });
    describe(':millisecondTimestamp', () => {
        it('should store a date as a millisecond timestamp', async () => {
            const now = new Date();
            record.msTimestamp = now;
            chai_1.expect(record.msTimestamp).to.be.a('date');
            chai_1.expect(record.toJSON().msTimestamp).to.be.a('number');
            chai_1.expect(record.msTimestamp.valueOf()).to.eq(now.valueOf());
            chai_1.expect(record.getAttributeDynamoValue('msTimestamp')).to.deep.eq({
                N: now.valueOf().toString(),
            });
        });
    });
    describe('Passing strings', () => {
        it('should allow strings to be passed with date only', async () => {
            record.dateOnly = '2021-02-24';
            chai_1.expect(record.dateOnly).to.be.a('date');
            chai_1.expect(record.dateOnly.toISOString()).to.eq('2021-02-24T00:00:00.000Z');
        });
        it('should allow strings to be passed with date and time', async () => {
            record.fullDate = '2018-01-25T23:55:39.000Z';
            chai_1.expect(record.fullDate).to.be.a('date');
            chai_1.expect(record.fullDate.toISOString()).to.eq('2018-01-25T23:55:39.000Z');
        });
    });
    describe('.fromJSON', () => {
        it('should ignore empty values', async () => {
            record.fromJSON({
                dateOnly: '',
                fullDate: '',
            });
            chai_1.expect(record.dateOnly).to.be.eq(null);
            chai_1.expect(record.fullDate).to.be.eq(null);
        });
        it('should accept string values', async () => {
            record.fromJSON({
                dateOnly: '2021-02-24',
                fullDate: '2018-01-25T23:55:39.000Z',
            });
            chai_1.expect(record.dateOnly).to.be.a('date');
            chai_1.expect(record.dateOnly.toISOString()).to.eq('2021-02-24T00:00:00.000Z');
            chai_1.expect(record.fullDate).to.be.a('date');
            chai_1.expect(record.fullDate.toISOString()).to.eq('2018-01-25T23:55:39.000Z');
        });
    });
});
//# sourceMappingURL=date.spec.js.map