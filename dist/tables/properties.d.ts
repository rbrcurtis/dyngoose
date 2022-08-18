import { BinarySetAttributeValue } from 'aws-sdk/clients/dynamodb';
import { Table } from '../table';
export declare type TableProperty<T> = Exclude<keyof T, keyof Table>;
declare type KeyOfType<T, V> = keyof {
    [P in keyof T as T[P] extends V ? P : never]: any;
};
export declare type SetValue = string[] | Array<BigInt | number> | BinarySetAttributeValue[] | null | undefined;
export declare type SetTableProperty<T> = KeyOfType<T, SetValue>;
export declare type TableProperties<T> = {
    [key in TableProperty<T>]?: T[key];
};
export {};
