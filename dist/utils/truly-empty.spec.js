"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const truly_empty_1 = require("./truly-empty");
describe('utils/empty', () => {
    describe('isTrulyEmpty', () => {
        it('nil', () => {
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)(null)).to.eq(true);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)(undefined)).to.eq(true);
        });
        it('booleans', () => {
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)(true)).to.eq(false);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)(false)).to.eq(false);
        });
        it('dates', () => {
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)(new Date())).to.eq(false);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)(new Date(0))).to.eq(false);
        });
        it('strings', () => {
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)('')).to.eq(true);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)(' ')).to.eq(true);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)('a')).to.eq(false);
        });
        it('numbers', () => {
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)(0)).to.eq(false);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)(0.0)).to.eq(false);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)(100.500)).to.eq(false);
        });
        it('objects', () => {
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)({})).to.eq(true);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)({ a: undefined })).to.eq(true);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)({ a: {} })).to.eq(true);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)({ a: { a: null } })).to.eq(true);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)({ a: true })).to.eq(false);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)({ a: false })).to.eq(false);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)({ a: { b: true } })).to.eq(false);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)({ a: { b: false } })).to.eq(false);
            // verify it does not mutate
            const value = { prop: false };
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)(value)).to.eq(false);
            (0, chai_1.expect)(value).to.deep.eq({ prop: false });
        });
        it('arrays', () => {
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)([])).to.eq(true);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)([null])).to.eq(true);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)([true])).to.eq(false);
            (0, chai_1.expect)((0, truly_empty_1.isTrulyEmpty)([false])).to.eq(false);
        });
    });
});
//# sourceMappingURL=truly-empty.spec.js.map