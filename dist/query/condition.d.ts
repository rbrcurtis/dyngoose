import { Table } from '../dyngoose';
import { MagicSearch } from './search';
export declare class Condition<T extends Table, Attr, AttributeValueType> {
    private readonly search;
    private readonly key;
    private _not;
    private filter;
    constructor(search: MagicSearch<T>, attributeName: Attr);
    not(): this;
    /**
     * Equal
     *
     * Works for all data types, including lists and maps.
     * Will look for 100% equality, when performing a search on a list, the docum
     *
     * - If the target attribute of the comparison is of type String, Number, or Binary, then the operator checks for
     *   a absolute match (similar to === in javascript).
     * - If the target attribute of the comparison is a set ("SS", "NS", or "BS"), then the operator evaluates to true if
     *   it finds every item specified and only the items specified (similar to _.isEqual in javascript).
     * - If the target attribute of the comparison is a Map, then the operator evaluates to true if the two objects map
     *   recursively (similar to _.isEqual in javascript).
     */
    eq(value: NonNullable<AttributeValueType>): MagicSearch<T>;
    /**
     * Less than
     *
     * Works for String, Number, or Binary (not a set type) attribute.
     * Does not work on sets.
     */
    lt(value: AttributeValueType extends any[] ? never : NonNullable<AttributeValueType>): MagicSearch<T>;
    /**
     * Less than or equal
     *
     * Works for String, Number, or Binary (not a set type) attribute.
     * Does not work on sets.
     */
    lte(value: AttributeValueType extends any[] ? never : NonNullable<AttributeValueType>): MagicSearch<T>;
    /**
     * Greater than
     *
     * Works for String, Number, or Binary (not a set type) attribute.
     * Does not work on sets.
     */
    gt(value: AttributeValueType extends any[] ? never : NonNullable<AttributeValueType>): MagicSearch<T>;
    /**
     * Greater than or equal
     *
     * Works for String, Number, or Binary (not a set type) attribute.
     * Does not work on sets.
     */
    gte(value: AttributeValueType extends any[] ? never : NonNullable<AttributeValueType>): MagicSearch<T>;
    /**
     * Checks for a prefix.
     *
     * Only works for String or Binary fields.
     * Does not work for numbers or sets.
     */
    beginsWith(value: AttributeValueType extends any[] ? never : Exclude<AttributeValueType, number>): MagicSearch<T>;
    /**
     * Checks for a subsequence, or value in a set.
     *
     * Condition value can contain only be a String, Number, or Binary (not a set type).
     *
     * - If the target attribute of the comparison is of type String, then the operator checks for a substring match.
     * - If the target attribute of the comparison is of type Binary, then the operator looks for a subsequence of the
     *   target that matches the input.
     * - If the target attribute of the comparison is a set ("SS", "NS", or "BS"), then the operator evaluates to true if
     *   it finds an exact match with any member of the set.
     *
     * When using `.not().contains(value)` this checks for the absence of a subsequence, or absence of a value in a set.
     */
    contains(value: AttributeValueType extends Array<infer E> ? E : AttributeValueType): MagicSearch<T>;
    exists(): MagicSearch<T>;
    /**
     * Checks for matching elements in a list.
     *
     * If any of the values specified are equal to the item attribute, the expression evaluates to true.
     *
     * This is a rather complicated method, so here is a simple example.
     *
     * **Example documents:**
     *   [ { "name": "Bob "}, { "name": "Robert" }, { "name": "Robby" } ]
     *
     * **Example condition:**
     *   `filter('name').includes(['Bob', 'Robert'])`
     *
     * **Example result:**
     *   [ { "name": "Bob "}, { "name": "Robert" } ]
     *
     * Works for String, Number, or Binary (not a set type) attribute.
     * Does not work on sets.
     */
    includes(...values: AttributeValueType extends any[] ? never : AttributeValueType[]): MagicSearch<T>;
    /**
     * A utility method, identical as if you did `.not().includes(…)`
     */
    excludes(...values: AttributeValueType extends any[] ? never : AttributeValueType[]): MagicSearch<T>;
    /**
     * Greater than or equal to the first (lower) value, and less than or equal to the second (upper) value.
     *
     * Works for String, Number, or Binary (not a set type) attribute.
     * Does not work on sets.
     */
    between(lower: AttributeValueType extends any[] ? never : NonNullable<AttributeValueType>, upper: AttributeValueType extends any[] ? never : NonNullable<AttributeValueType>): MagicSearch<T>;
    /**
     * The attribute does not exist.
     *
     * NULL is supported for all data types, including lists and maps.
     */
    null(): MagicSearch<T>;
    private finalize;
}
