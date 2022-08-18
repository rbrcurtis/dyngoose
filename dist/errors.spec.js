"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingTable = void 0;
const chai_1 = require("chai");
const Dyngoose = require(".");
let MissingTable = class MissingTable extends Dyngoose.Table {
};
__decorate([
    Dyngoose.Attribute.Number({ default: 1 }),
    __metadata("design:type", Number)
], MissingTable.prototype, "id", void 0);
__decorate([
    Dyngoose.Attribute.String(),
    __metadata("design:type", String)
], MissingTable.prototype, "title", void 0);
__decorate([
    Dyngoose.$PrimaryKey('id', 'title'),
    __metadata("design:type", Dyngoose.Query.PrimaryKey)
], MissingTable, "primaryKey", void 0);
MissingTable = __decorate([
    Dyngoose.$Table({
        name: `missing-table-${Math.random()}`,
    })
], MissingTable);
exports.MissingTable = MissingTable;
describe('DyngooseError', () => {
    it('should throw "Cannot do operations on a non-existent table"', async () => {
        const record = MissingTable.new({
            id: 1,
            title: 'test',
        });
        let error;
        try {
            await record.save();
        }
        catch (ex) {
            error = ex;
        }
        chai_1.expect(error).to.be.instanceOf(Error)
            .with.property('name', 'ResourceNotFoundException');
        chai_1.expect(error).to.have.property('message', 'Cannot do operations on a non-existent table');
    });
});
//# sourceMappingURL=errors.spec.js.map