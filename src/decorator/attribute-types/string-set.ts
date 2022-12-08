import { DynamoDB } from 'aws-sdk'
import { every, isString, uniq } from 'lodash'
import { DynamoAttributeType } from '../../dynamo-attribute-types'
import { ValidationError } from '../../errors'
import { IAttributeType } from '../../interfaces'
import { StringSetAttributeMetadata } from '../../metadata/attribute-types/string-set.metadata'
import { AttributeType } from '../../tables/attribute-type'

type Value = DynamoDB.StringSetAttributeValue
type Metadata = StringSetAttributeMetadata

export class StringSetAttributeType extends AttributeType<Value, Metadata> implements IAttributeType<Value> {
  type = DynamoAttributeType.StringSet

  toDynamo(values: Value): DynamoDB.AttributeValue {
    if (!Array.isArray(values) || !every(values, isString)) {
      throw new ValidationError(`Expected ${this.propertyName} to be an array of strings`)
    }

    if (!values.length) {
      return {}
    }

    // dynamodb does not allow sets to contain duplicate values, so ensure uniqueness here
    return {
      SS: uniq(values.map((value) => String(value))),
    }
  }
}
