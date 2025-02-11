"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const _ = require("lodash");
const lodash_1 = require("lodash");
const document_client_1 = require("./document-client");
const search_1 = require("./query/search");
const create_table_1 = require("./tables/create-table");
const delete_table_1 = require("./tables/delete-table");
const describe_table_1 = require("./tables/describe-table");
const migrate_table_1 = require("./tables/migrate-table");
const schema_1 = require("./tables/schema");
const truly_empty_1 = require("./utils/truly-empty");
class Table {
    // #endregion properties
    /**
     * Create a new Table record by attribute names, not property names.
     *
     * @see {@link Table.new} To create a strongly-typed record by property names.
     */
    constructor(values) {
        // raw storage for all attributes this record (instance) has
        this.__attributes = {};
        this.__original = {};
        this.__updatedAttributes = [];
        this.__removedAttributes = [];
        this.__updateOperators = {};
        this.__putRequired = true; // true when this is a new record and a putItem is required, false when updateItem can be used
        this.__entireDocumentIsKnown = true;
        if (values != null) {
            for (const key of _.keys(values)) {
                this.setAttribute(key, values[key]);
            }
        }
    }
    // #region static
    // #region static properties
    static get schema() {
        if (this.__schema == null) {
            this.__schema = new schema_1.Schema(this);
        }
        return this.__schema;
    }
    static set schema(schema) {
        this.__schema = schema;
    }
    static get documentClient() {
        if (this.__documentClient == null) {
            this.__documentClient = new document_client_1.DocumentClient(this);
        }
        return this.__documentClient;
    }
    static set documentClient(documentClient) {
        this.__documentClient = documentClient;
    }
    // #endregion static properties
    // #region static methods
    /**
     * Creates a new record for this table.
     *
     * This method is strongly typed and it is recommended you use over `new Table(…)`
     */
    static new(values) {
        const record = new this().applyDefaults();
        if (values != null) {
            record.setValues(values);
        }
        record.__putRequired = true;
        return record;
    }
    static async create(values, event) {
        // @ts-ignore
        const record = this.new();
        Object.entries(values !== null && values !== void 0 ? values : {}).forEach(([key, val]) => {
            try {
                record[key] = val;
            }
            catch (e) {
                //
            }
        });
        await record.save((0, lodash_1.extend)(event, { operator: 'put' }));
        return record;
    }
    /**
     * Creates a new instance of Table with values from a given `DynamoDB.AttributeMap`.
     *
     * This assumes the record exists in DynamoDB and saving this record will
     * default to using an `UpdateItem` operation rather than a `PutItem` operation
     * upon being saved.
     */
    static fromDynamo(attributes, entireDocument = true) {
        const item = new this().fromDynamo(attributes, entireDocument);
        item === null || item === void 0 ? void 0 : item.applyDefaults();
        return item;
    }
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
    static fromJSON(json, ignoreArbitrary = true) {
        const item = new this().fromJSON(json, ignoreArbitrary);
        item === null || item === void 0 ? void 0 : item.applyDefaults();
        return item;
    }
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
    static search(filters, input = {}) {
        return new search_1.MagicSearch(this, filters, input);
    }
    /**
     * Creates the table in DynamoDB.
     *
     * You can also use {@link Table.migrateTable} to create and automatically
     * migrate and indexes that need changes.
     */
    static async createTable(waitForReady = true) {
        return await (0, create_table_1.createTable)(this.schema, waitForReady);
    }
    /**
     * Migrates the table to match updated specifications.
     *
     * This will create new indexes and delete legacy indexes.
     */
    static async migrateTable() {
        return await (0, migrate_table_1.migrateTable)(this.schema);
    }
    /**
     * Deletes the table from DynamoDB.
     *
     * Be a bit careful with this in production.
     */
    static async deleteTable() {
        return await (0, delete_table_1.deleteTable)(this.schema);
    }
    static async describeTable() {
        return await (0, describe_table_1.describeTable)(this.schema);
    }
    // #endregion static methods
    // #endregion static
    // #region properties
    get table() {
        return this.constructor;
    }
    // #region public methods
    /**
     * Apply any default values for attributes.
     */
    applyDefaults() {
        const attributes = this.table.schema.getAttributes();
        for (const [, attribute] of attributes) {
            const defaultValue = attribute.getDefaultValue();
            if (defaultValue != null && this.getByAttribute(attribute) == null) {
                this.setByAttribute(attribute, defaultValue);
            }
        }
        return this;
    }
    /**
     * Load values from an a DynamoDB.AttributeMap into this Table record.
     *
     * This assumes the values are loaded directly from DynamoDB, and after
     * setting the attributes it resets the attributes pending update and
     * deletion.
     */
    fromDynamo(values, entireDocument = true) {
        this.__attributes = values;
        // this is an existing record in the database, so when we save it, we need to update
        this.__updatedAttributes = [];
        this.__removedAttributes = [];
        this.__putRequired = false;
        this.__entireDocumentIsKnown = entireDocument;
        return this;
    }
    /**
     * Converts the current attribute values into a DynamoDB.AttributeMap which
     * can be sent directly to DynamoDB within a PutItem, UpdateItem, or similar
     * request.
     */
    toDynamo(enforceRequired = true) {
        // anytime toDynamo is called, it can generate new default values or manipulate values
        // this keeps the record in sync, so the instance can be used after the record is saved
        const attributeMap = this.table.schema.toDynamo(this, enforceRequired);
        for (const attributeName of Object.keys(attributeMap)) {
            if (!_.isEqual(this.__attributes[attributeName], attributeMap[attributeName])) {
                this.__updatedAttributes.push(attributeName);
                this.__updatedAttributes = _.uniq(this.__updatedAttributes);
            }
        }
        this.__attributes = attributeMap;
        this.afterLoad();
        return this.__attributes;
    }
    /**
     * Get the DynamoDB.Key for this record.
     */
    getDynamoKey() {
        const hash = this.getAttribute(this.table.schema.primaryKey.hash.name);
        const key = {
            [this.table.schema.primaryKey.hash.name]: this.table.schema.primaryKey.hash.toDynamoAssert(hash),
        };
        if (this.table.schema.primaryKey.range != null) {
            const range = this.getAttribute(this.table.schema.primaryKey.range.name);
            key[this.table.schema.primaryKey.range.name] = this.table.schema.primaryKey.range.toDynamoAssert(range);
        }
        return key;
    }
    /**
     * Get the list of attributes pending update.
     *
     * The result includes attributes that have also been deleted. To get just
     * the list of attributes pending deletion, use {@link Table.getDeletedAttributes}.
     *
     * If you want to easily know if this record has updates pending, use {@link Table.hasChanges}.
     */
    getUpdatedAttributes() {
        return this.__updatedAttributes;
    }
    /**
     * Get the list of attributes pending deletion.
     *
     * To get all the attributes that have been updated, use {@link Table.getUpdatedAttributes}.
     *
     * If you want to easily know if this record has updates pending, use {@link Table.hasChanges}.
     */
    getDeletedAttributes() {
        return this.__removedAttributes;
    }
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
    fromJSON(json, entireDocument = true) {
        const blacklist = this.table.getBlacklist();
        _.each(json, (value, propertyName) => {
            let attribute;
            try {
                attribute = this.table.schema.getAttributeByPropertyName(propertyName);
            }
            catch (ex) {
                return;
            }
            if (!_.includes(blacklist, attribute.name)) {
                // allow the attribute to transform the value via a custom fromJSON method
                if (!(0, truly_empty_1.isTrulyEmpty)(value) && typeof attribute.type.fromJSON === 'function') {
                    value = attribute.type.fromJSON(value);
                }
                const currentValue = this.getAttribute(attribute.name);
                // compare to current value, to avoid unnecessarily marking attributes as needing to be saved
                if (!_.isEqual(currentValue, value)) {
                    if ((0, truly_empty_1.isTrulyEmpty)(value)) {
                        this.removeAttribute(attribute.name);
                    }
                    else {
                        this.setByAttribute(attribute, value);
                    }
                }
            }
        });
        // this might be from raw json so when we save, save the entire document
        this.__updatedAttributes = [];
        this.__removedAttributes = [];
        this.__putRequired = !entireDocument;
        this.__entireDocumentIsKnown = entireDocument;
        this.afterLoad();
        return this;
    }
    /**
     * Returns the DynamoDB.AttributeValue value for an attribute.
     *
     * To get the transformed value, use {@link Table.getAttribute}
     */
    getAttributeDynamoValue(attributeName) {
        return this.__attributes[attributeName];
    }
    /**
     * Gets the JavaScript transformed value for an attribute.
     *
     * While you can read values directly on the Table record by its property name,
     * sometimes you need to get attribute.
     *
     * Unlike {@link Table.get}, this excepts the attribute name, not the property name.
     */
    getAttribute(attributeName) {
        const attribute = this.table.schema.getAttributeByName(attributeName);
        return this.getByAttribute(attribute);
    }
    /**
     * Get the update operator for an attribute.
     */
    getUpdateOperator(attributeName) {
        var _a;
        return (_a = this.__updateOperators[attributeName]) !== null && _a !== void 0 ? _a : 'set';
    }
    /**
     * Set the update operator for an attribute.
     */
    setAttributeUpdateOperator(attributeName, operator) {
        this.__updateOperators[attributeName] = operator;
        return this;
    }
    /**
     * Sets the DynamoDB.AttributeValue for an attribute.
     *
     * To set the value from a JavaScript object, use {@link Table.setAttribute}
     */
    setAttributeDynamoValue(attributeName, attributeValue) {
        var _a;
        var _b;
        // save the original value before we update the attributes value
        (_a = (_b = this.__original)[attributeName]) !== null && _a !== void 0 ? _a : (_b[attributeName] = this.getAttributeDynamoValue(attributeName));
        // store the new value
        this.__attributes[attributeName] = attributeValue;
        // track that this value was updated
        this.__updatedAttributes.push(attributeName);
        this.__updatedAttributes = _.uniq(this.__updatedAttributes);
        // ensure the attribute is not marked for being deleted
        _.pull(this.__removedAttributes, attributeName);
        return this;
    }
    /**
     * Sets the value of an attribute by attribute name from a JavaScript object.
     *
     * - To set an attribute value by property name, use {@link Table.set}.
     */
    setAttribute(attributeName, value, params) {
        const attribute = this.table.schema.getAttributeByName(attributeName);
        return this.setByAttribute(attribute, value, params);
    }
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
    setAttributes(values) {
        _.forEach(values, (value, attributeName) => {
            this.setAttribute(attributeName, value);
        });
        return this;
    }
    /**
     * Remove a single attribute by its attribute name.
     *
     * Replaced by {@link Table.removeAttribute}.
     * @deprecated Since 3.0.0, will be removed in 4.0.0
     */
    deleteAttribute(attributeName) {
        return this.removeAttribute(attributeName);
    }
    /**
     * Remove a single attribute by its attribute name.
     *
     * @see {@link Table.remove} Remove an attribute by its property name.
     * @see {@link Table.removeAttributes} Remove several attributes by their property names.
     */
    removeAttribute(attributeName) {
        // delete the attribute as long as it existed and wasn't already null
        if (!_.isNil(this.__attributes[attributeName]) || !this.__entireDocumentIsKnown) {
            this.__attributes[attributeName] = { NULL: true };
            this.__removedAttributes.push(attributeName);
            this.__removedAttributes = _.uniq(this.__removedAttributes);
            _.pull(this.__updatedAttributes, attributeName);
        }
        return this;
    }
    /**
     * Mark several attributes to be removed.
     *
     * Replaced by {@link Table.removeAttributes}.
     * @deprecated Since 3.0.0, will be removed in 4.0.0
     */
    deleteAttributes(attributes) {
        return this.removeAttributes(attributes);
    }
    /**
     * Remove several attributes by their property names.
     *
     * @see {@link Table.remove} Remove an attribute by its property name.
     * @see {@link Table.removeAttribute} Remove a single attribute by its attribute name.
     */
    removeAttributes(attributes) {
        for (const attribute of attributes) {
            this.removeAttribute(attribute);
        }
        return this;
    }
    /**
     * Sets a value of an attribute by its property name.
     *
     * @see {@link Table.setValues} To set several attribute values by property names.
     * @see {@link Table.setAttribute} To set an attribute value by an attribute name.
     * @see {@link Table.setAttributes} To set several attribute values by attribute names.
     */
    set(propertyName, value, params) {
        let attribute;
        try {
            attribute = this.table.schema.getAttributeByPropertyName(propertyName);
        }
        catch (err) {
            return this;
        }
        return this.setByAttribute(attribute, value, params);
    }
    /**
     * Gets a value of an attribute by its property name.
     *
     * @see {@link Table.getAttribute} To get a value by an attribute name.
     * @see {@link Table.toJSON} To get the entire record.
     */
    get(propertyName) {
        const attribute = this.table.schema.getAttributeByPropertyName(propertyName);
        return this.getByAttribute(attribute);
    }
    /**
     * Remove an attribute by its property name.
     *
     * Replaced by {@link Table.remove}
     * @deprecated Since 3.0.0, will be removed in 4.0.0
     */
    del(propertyName) {
        return this.remove(propertyName);
    }
    /**
     * Remove an attribute by its property name.
     *
     * @see {@link Table.removeAttribute} Remove a single attribute by its attribute name.
     * @see {@link Table.removeAttributes} Remove several attributes by their property names.
     */
    remove(propertyName) {
        const attribute = this.table.schema.getAttributeByPropertyName(propertyName);
        return this.removeAttribute(attribute.name);
    }
    /**
     * Update several attribute values on this record by property names.
     *
     * @see {@link Table.set} To set an attribute value by property name.
     * @see {@link Table.setAttribute} To set an attribute value by an attribute names.
     * @see {@link Table.setAttributes} To set several attribute values by attribute names.
     */
    setValues(values) {
        for (const key in values) {
            this.set(key, values[key]);
        }
        return this;
    }
    /**
     * Sets (StringSet, NumberSet, and BinarySet) in DynamoDB have some unique rules:
     *
     * Each value within a set must be unique.
     * The order of the values within a set is not preserved.
     *
     * Therefore, your applications must not rely on any particular order of elements within the set.
     * DynamoDB does not support empty sets, however, empty string and binary values are allowed within a set.
     */
    updateSet(propertyName, set, clean = true) {
        const newSet = clean ? _.filter(_.uniq(set)) : set;
        if (newSet.length > 0) {
            const currentSet = this.get(propertyName);
            if (currentSet == null ||
                currentSet.length === 0 ||
                newSet.length !== currentSet.length ||
                _.intersection(currentSet, newSet).length !== newSet.length) {
                this.set(propertyName, newSet);
            }
        }
        return this;
    }
    /**
     * Determines if this record has any attributes pending an update or deletion.
     */
    hasChanges() {
        return this.__updatedAttributes.length > 0 || this.__removedAttributes.length > 0;
    }
    /**
     * Return the original values for the record, if it was loaded from DynamoDB.
     */
    getOriginalValues() {
        return this.__original;
    }
    async save(event) {
        var _a;
        const operator = (_a = event === null || event === void 0 ? void 0 : event.operator) !== null && _a !== void 0 ? _a : this.getSaveOperation();
        const beforeSaveEvent = {
            ...event,
            operator,
        };
        const allowSave = await this.beforeSave(beforeSaveEvent);
        Object.entries(this.__attributes).forEach(([key, val]) => {
            if (val.SS && (0, truly_empty_1.isTrulyEmpty)(val.SS)) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete this.__attributes[key];
            }
        });
        if (beforeSaveEvent.force === true || (allowSave !== false && this.hasChanges())) {
            let output;
            if (beforeSaveEvent.operator === 'put') {
                output = await this.table.documentClient.put(this, beforeSaveEvent);
                this.__putRequired = false;
            }
            else {
                output = await this.table.documentClient.update(this, beforeSaveEvent);
            }
            // trigger afterSave before clearing values, so the hook can determine what has been changed
            await this.afterSave({
                ...beforeSaveEvent,
                output,
                deletedAttributes: this.__removedAttributes,
                updatedAttributes: this.__updatedAttributes,
            });
            // reset internal tracking of changes attributes
            this.__removedAttributes = [];
            this.__updatedAttributes = [];
            if (beforeSaveEvent.returnOutput === true) {
                return output;
            }
        }
    }
    /**
     * Returns whether this is a newly created record that hasn't been saved
     * It is not a guarantee that the hash key is not already in use
     */
    isNew() {
        return this.__putRequired;
    }
    /**
     * Determine the best save operation method to use based upon the item's current state
     */
    getSaveOperation() {
        let type;
        if (this.__putRequired || !this.hasChanges()) {
            type = 'put';
        }
        else {
            type = 'update';
        }
        return type;
    }
    async delete(event) {
        const beforeDeleteEvent = { ...event };
        const allowDeletion = await this.beforeDelete(beforeDeleteEvent);
        if (allowDeletion) {
            const output = await this.table.documentClient.delete(this, event === null || event === void 0 ? void 0 : event.conditions);
            const afterDeleteEvent = {
                ...beforeDeleteEvent,
                output,
            };
            await this.afterDelete(afterDeleteEvent);
            if (beforeDeleteEvent.returnOutput === true) {
                return output;
            }
        }
    }
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
    toJSON() {
        const json = {};
        for (const [attributeName, attribute] of this.table.schema.getAttributes()) {
            const propertyName = attribute.propertyName;
            const value = this.getAttribute(attributeName);
            if (!(0, truly_empty_1.isTrulyEmpty)(value)) {
                if (_.isFunction(attribute.type.toJSON)) {
                    json[propertyName] = attribute.type.toJSON(value, attribute);
                }
                else {
                    json[propertyName] = value;
                }
            }
        }
        return json;
    }
    // #endregion public methods
    // #region protected methods
    async beforeSave(event) {
        return true;
    }
    /**
     * After a record is deleted, this handler is called.
     */
    async afterSave(event) {
        return undefined;
    }
    /**
     * Before a record is deleted, this handler is called and if the promise
     * resolves as false, the delete request will be ignored.
     */
    async beforeDelete(event) {
        return true;
    }
    /**
     * After record is loaded from the db or fromJson, this handler is called.
     */
    afterLoad() {
        return undefined;
    }
    /**
     * After a record is deleted, this handler is called.
     */
    async afterDelete(event) {
        return undefined;
    }
    setByAttribute(attribute, value, params = {}) {
        var _a, _b;
        var _c, _d;
        const attributeValue = attribute.toDynamo(value);
        // avoid recording the value if it is unchanged, so we do not send it as an updated value during a save
        if (params.force !== true &&
            !_.isUndefined(this.__attributes[attribute.name]) &&
            _.isEqual(this.__attributes[attribute.name], attributeValue)) {
            return this;
        }
        if (attributeValue == null) {
            (_a = (_c = this.__original)[_d = attribute.name]) !== null && _a !== void 0 ? _a : (_c[_d] = this.getAttributeDynamoValue(attribute.name));
            this.removeAttribute(attribute.name);
        }
        else {
            this.setAttributeDynamoValue(attribute.name, attributeValue);
            this.setAttributeUpdateOperator(attribute.name, (_b = params.operator) !== null && _b !== void 0 ? _b : 'set');
        }
        return this;
    }
    getByAttribute(attribute) {
        const attributeValue = this.getAttributeDynamoValue(attribute.name);
        const value = attribute.fromDynamo(_.cloneDeep(attributeValue));
        return value;
    }
    /**
     * Returns a list of attributes that should not be allowed when Table.fromJSON is used.
     */
    static getBlacklist() {
        return [];
    }
}
exports.Table = Table;
//# sourceMappingURL=table.js.map