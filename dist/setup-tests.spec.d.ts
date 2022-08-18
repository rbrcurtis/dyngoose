import { Dyngoose } from '.';
export declare class TestableTable extends Dyngoose.Table {
    static readonly primaryKey: Dyngoose.Query.PrimaryKey<TestableTable, number, string>;
    static readonly titleIndex: Dyngoose.Query.GlobalSecondaryIndex<TestableTable>;
    static readonly documentClient: Dyngoose.DocumentClient<TestableTable>;
    generic: any;
    id: number;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    unixTimestamp: Date;
    msTimestamp: Date;
    dateOnly: Date;
    fullDate: Date;
    defaultedString: string;
    testString: string;
    testStringSet: string[];
    lowercaseString: string;
    uppercaseString: string;
    trimmedString: string;
    testNumber: number;
    testNumberSet?: Array<BigInt | number> | null;
    testNumberSetWithDefaults: number[];
    testBigInt: BigInt;
    testAttributeNaming: string;
}
