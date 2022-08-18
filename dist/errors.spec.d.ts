import * as Dyngoose from '.';
export declare class MissingTable extends Dyngoose.Table {
    static readonly primaryKey: Dyngoose.Query.PrimaryKey<MissingTable, number, string>;
    id: number;
    title: string;
}
