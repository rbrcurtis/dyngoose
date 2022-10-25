import { DynamoDB } from 'aws-sdk';
import { Attribute } from './attribute';
import { DocumentClient } from './document-client';
import * as Events from './events';
import { SetPropParams, UpdateOperator } from './interfaces';
import { Filters } from './query/filters';
import { MagicSearch, MagicSearchInput } from './query/search';
import { SetTableProperty, SetValue, TableProperties, TableProperty } from './tables/properties';
import { Schema } from './tables/schema';
declare type StaticThis<T> = new () => T;
export declare class Table {
    static get schema(): Schema;
    static set schema(schema: Schema);
    static get documentClient(): DocumentClient<Table>;
    static set documentClient(documentClient: DocumentClient<Table>);
    private static __schema;
    private static __documentClient;
    /**
     * Creates a new record for this table.
     *
     * This method is strongly typed and it is recommended you use over `new Table(…)`
     */
    static new<T extends Table>(this: StaticThis<T>, values?: TableProperties<T>): T;
    /**
     * Creates a new instance of Table with values from a given `DynamoDB.AttributeMap`.
     *
     * This assumes the record exists in DynamoDB and saving this record will
     * default to using an `UpdateItem` operation rather than a `PutItem` operation
     * upon being saved.
     */
    static fromDynamo<T extends Table>(this: StaticThis<T>, attributes: DynamoDB.AttributeMap, entireDocument?: boolean): T;
    /**
     * Creates an instance of Table from raw user input. Designs to be used for creating
     * records from requests, like:
     *
     * express.js:
     *   ```app.post('/api/create', (req, res) => {
     *     const card = Card.fromJSON(req.body)
     *   })```
     *
     * Each attribute can optionally define additional validation logic or sanitization
     * of the user input, @see {@link https://github.com/benhutchins/dyngoose/blob/master/docs/Attributes}.
     */
    static fromJSON<T extends Table>(this: StaticThis<T>, json: {
        [attribute: string]: any;
    }): T;
    /**
     * Query DynamoDB for what you need.
     *
     * This is a powerful all-around querying method. It will detect the best index available for use,
     * but it ignores indexes that are not set to Projection of `ALL`. To please use the index-specific
     * querying when necessary.
     *
     * This will avoid performing a scan at all cost, but it will fall back to using a scan if necessary.
     *
     * By default, this returns you one "page" of results (allows DynamoDB) to process and return the
     * maximum of items DynamoDB allows. If you want it to internally page for you to return all possible
     * results (be cautious as that can easily cause timeouts for Lambda), specify `{ all: true }` as an
     * input argument for the second argument.
     */
    static search<T extends Table>(this: StaticThis<T>, filters?: Filters<T>, input?: MagicSearchInput<T>): MagicSearch<T>;
    /**
     * Creates the table in DynamoDB.
     *
     * You can also use {@link Table.migrateTable} to create and automatically
     * migrate and indexes that need changes.
     */
    static createTable(waitForReady?: boolean): Promise<DynamoDB.TableDescription>;
    /**
     * Migrates the table to match updated specifications.
     *
     * This will create new indexes and delete legacy indexes.
     */
    static migrateTable(): Promise<DynamoDB.TableDescription>;
    /**
     * Deletes the table from DynamoDB.
     *
     * Be a bit careful with this in production.
     */
    static deleteTable(): Promise<DynamoDB.TableDescription | undefined>;
    static describeTable(): Promise<DynamoDB.TableDescription>;
    protected get table(): typeof Table;
    private __attributes;
    private __original;
    private __updatedAttributes;
    private __removedAttributes;
    private __updateOperators;
    private __putRequired;
    private __entireDocumentIsKnown;
    /**
     * Create a new Table record by attribute names, not property names.
     *
     * @see {@link Table.new} To create a strongly-typed record by property names.
     */
    constructor(values?: {
        [key: string]: any;
    });
    /**
     * Apply any default values for attributes.
     */
    applyDefaults(): this;
    /**
     * Load values from an a DynamoDB.AttributeMap into this Table record.
     *
     * This assumes the values are loaded directly from DynamoDB, and after
     * setting the attributes it resets the attributes pending update and
     * deletion.
     */
    fromDynamo(values: DynamoDB.AttributeMap, entireDocument?: boolean): this;
    /**
     * Converts the current attribute values into a DynamoDB.AttributeMap which
     * can be sent directly to DynamoDB within a PutItem, UpdateItem, or similar
     * request.
     */
    toDynamo(enforceRequired?: boolean): DynamoDB.AttributeMap;
    /**
     * Get the DynamoDB.Key for this record.
     */
    getDynamoKey(): DynamoDB.Key;
    /**
     * Get the list of attributes pending update.
     *
     * The result includes attributes that have also been deleted. To get just
     * the list of attributes pending deletion, use {@link Table.getDeletedAttributes}.
     *
     * If you want to easily know if this record has updates pending, use {@link Table.hasChanges}.
     */
    getUpdatedAttributes(): string[];
    /**
     * Get the list of attributes pending deletion.
     *
     * To get all the attributes that have been updated, use {@link Table.getUpdatedAttributes}.
     *
     * If you want to easily know if this record has updates pending, use {@link Table.hasChanges}.
     */
    getDeletedAttributes(): string[];
    /**
     * While similar to setAttributes, this method runs the attribute's defined fromJSON
     * methods to help standardize the attribute values as much as possible.
     *
     * @param {any} json A JSON object
     * @param {boolean} [ignoreArbitrary] Whether arbitrary attributes should be ignored.
     *        When false, unknown attributes will result in an error being thrown.
     *        When true, any non-recognized attribute will be ignored. Useful if you're
     *        passing in raw request body objects or dealing with user input.
     *        Defaults to false.
     */
    fromJSON(json: {
        [attribute: string]: any;
    }, ignoreArbitrary?: boolean): this;
    /**
     * Returns the DynamoDB.AttributeValue value for an attribute.
     *
     * To get the transformed value, use {@link Table.getAttribute}
     */
    getAttributeDynamoValue(attributeName: string): DynamoDB.AttributeValue;
    /**
     * Gets the JavaScript transformed value for an attribute.
     *
     * While you can read values directly on the Table record by its property name,
     * sometimes you need to get attribute.
     *
     * Unlike {@link Table.get}, this excepts the attribute name, not the property name.
     */
    getAttribute(attributeName: string): any;
    /**
     * Get the update operator for an attribute.
     */
    getUpdateOperator(attributeName: string): UpdateOperator;
    /**
     * Set the update operator for an attribute.
     */
    setAttributeUpdateOperator(attributeName: string, operator: UpdateOperator): this;
    /**
     * Sets the DynamoDB.AttributeValue for an attribute.
     *
     * To set the value from a JavaScript object, use {@link Table.setAttribute}
     */
    setAttributeDynamoValue(attributeName: string, attributeValue: DynamoDB.AttributeValue): this;
    /**
     * Sets the value of an attribute by attribute name from a JavaScript object.
     *
     * - To set an attribute value by property name, use {@link Table.set}.
     */
    setAttribute(attributeName: string, value: any, params?: SetPropParams): this;
    /**
     * Sets several attribute values on this record by attribute names.
     *
     * - To set several values by property names, use {@link Table.setValues}.
     * - To set a single attribute value by attribute name, use {@link Table.setAttribute}.
     * - To set a single attribute value by property name, use {@link Table.set}.
     *
     * @param {object} values An object, where the keys are the attribute names,
     *                        and the values are the values you'd like to set.
     */
    setAttributes(values: {
        [name: string]: any;
    }): this;
    /**
     * Remove a single attribute by its attribute name.
     *
     * Replaced by {@link Table.removeAttribute}.
     * @deprecated Since 3.0.0, will be removed in 4.0.0
     */
    deleteAttribute(attributeName: string): this;
    /**
     * Remove a single attribute by its attribute name.
     *
     * @see {@link Table.remove} Remove an attribute by its property name.
     * @see {@link Table.removeAttributes} Remove several attributes by their property names.
     */
    removeAttribute(attributeName: string): this;
    /**
     * Mark several attributes to be removed.
     *
     * Replaced by {@link Table.removeAttributes}.
     * @deprecated Since 3.0.0, will be removed in 4.0.0
     */
    deleteAttributes(attributes: string[]): this;
    /**
     * Remove several attributes by their property names.
     *
     * @see {@link Table.remove} Remove an attribute by its property name.
     * @see {@link Table.removeAttribute} Remove a single attribute by its attribute name.
     */
    removeAttributes(attributes: string[]): this;
    /**
     * Sets a value of an attribute by its property name.
     *
     * @see {@link Table.setValues} To set several attribute values by property names.
     * @see {@link Table.setAttribute} To set an attribute value by an attribute name.
     * @see {@link Table.setAttributes} To set several attribute values by attribute names.
     */
    set<P extends TableProperty<this>>(propertyName: P | string, value: this[P], params?: SetPropParams): this;
    /**
     * Gets a value of an attribute by its property name.
     *
     * @see {@link Table.getAttribute} To get a value by an attribute name.
     * @see {@link Table.toJSON} To get the entire record.
     */
    get<P extends TableProperty<this>>(propertyName: P | string): this[P];
    /**
     * Remove an attribute by its property name.
     *
     * Replaced by {@link Table.remove}
     * @deprecated Since 3.0.0, will be removed in 4.0.0
     */
    del<P extends TableProperty<this>>(propertyName: P | string): this;
    /**
     * Remove an attribute by its property name.
     *
     * @see {@link Table.removeAttribute} Remove a single attribute by its attribute name.
     * @see {@link Table.removeAttributes} Remove several attributes by their property names.
     */
    remove<P extends TableProperty<this>>(propertyName: P | string): this;
    /**
     * Update several attribute values on this record by property names.
     *
     * @see {@link Table.set} To set an attribute value by property name.
     * @see {@link Table.setAttribute} To set an attribute value by an attribute names.
     * @see {@link Table.setAttributes} To set several attribute values by attribute names.
     */
    setValues(values: TableProperties<this>): this;
    /**
     * Sets (StringSet, NumberSet, and BinarySet) in DynamoDB have some unique rules:
     *
     * Each value within a set must be unique.
     * The order of the values within a set is not preserved.
     *
     * Therefore, your applications must not rely on any particular order of elements within the set.
     * DynamoDB does not support empty sets, however, empty string and binary values are allowed within a set.
     */
    updateSet<P extends SetTableProperty<this>>(propertyName: P, set: SetValue, clean?: boolean): this;
    /**
     * Determines if this record has any attributes pending an update or deletion.
     */
    hasChanges(): boolean;
    /**
     * Return the original values for the record, if it was loaded from DynamoDB.
     */
    getOriginalValues(): DynamoDB.AttributeMap;
    /**
     * Save this record to DynamoDB.
     *
     * Will check to see if there are changes to the record, if there are none the save request is ignored.
     * To skip this check, use {@link Table.forceSave} instead.
     *
     * Calls the {@link Table.beforeSave} before saving the record.
     * If {@link Table.beforeSave} returns false, the save request is ignored.
     *
     * Automatically determines if the the save should use a PutItem or UpdateItem request.
     */
    save(event?: undefined | ({
        returnOutput?: false;
    } & Events.SaveEvent<this>)): Promise<void>;
    save(event: {
        returnOutput: true;
        operator?: undefined;
    } & Events.SaveEvent<this>): Promise<DynamoDB.PutItemOutput | DynamoDB.UpdateItemOutput>;
    save(event: {
        returnOutput: true;
        operator: 'put';
    } & Events.SaveEvent<this>): Promise<DynamoDB.PutItemOutput>;
    save(event: {
        returnOutput: true;
        operator: 'update';
    } & Events.SaveEvent<this>): Promise<DynamoDB.UpdateItemOutput>;
    /**
     * Returns whether this is a newly created record that hasn't been saved
     * It is not a guarantee that the hash key is not already in use
     */
    isNew(): boolean;
    /**
     * Determine the best save operation method to use based upon the item's current state
     */
    getSaveOperation(): 'put' | 'update';
    /**
     * Deletes this record from DynamoDB.
     *
     * Before deleting, it will call {@link Table.beforeDelete}. If {@link Table.beforeDelete}
     * returns false then this record will not be deleted.
     *
     * After deleting, {@link Table.afterDelete} will be called.
     */
    delete(event?: {
        returnOutput?: false;
    } & Events.DeleteEvent<this>): Promise<void>;
    delete(event: {
        returnOutput: true;
    } & Events.DeleteEvent<this>): Promise<DynamoDB.DeleteItemOutput>;
    /**
     * Convert this record to a JSON-exportable object.
     *
     * Has no consideration for "views" or "permissions", so all attributes
     * will be exported.
     *
     * Export object uses the property names as the object keys. To convert
     * a JSON object back into a Table record, use {@link Table.fromJSON}.
     *
     * Each attribute type can define a custom toJSON and fromJSON method,
     * @see {@link https://github.com/benhutchins/dyngoose/blog/master/docs/Attributes.md#custom-attribute-types}.
     */
    toJSON(): {
        [key: string]: any;
    };
    protected beforeSave(event: Events.BeforeSaveEvent<this>): Promise<boolean | undefined>;
    /**
     * After a record is deleted, this handler is called.
     */
    protected afterSave(event: Events.AfterSaveEvent<this>): Promise<void>;
    /**
     * Before a record is deleted, this handler is called and if the promise
     * resolves as false, the delete request will be ignored.
     */
    protected beforeDelete(event: Events.BeforeDeleteEvent<this>): Promise<boolean>;
    /**
     * After a record is deleted, this handler is called.
     */
    protected afterDelete(event: Events.AfterDeleteEvent<this>): Promise<void>;
    protected setByAttribute(attribute: Attribute<any>, value: any, params?: SetPropParams): this;
    protected getByAttribute(attribute: Attribute<any>): any;
    /**
     * Returns a list of attributes that should not be allowed when Table.fromJSON is used.
     */
    protected static getBlacklist(): string[];
}
export interface ITable<T extends Table> {
    schema: Schema;
    documentClient: DocumentClient<T>;
    new (): T;
    fromDynamo: (attributes: DynamoDB.AttributeMap, entireDocument?: boolean) => T;
}
export {};
