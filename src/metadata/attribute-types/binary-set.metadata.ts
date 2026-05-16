import { DynamoDB } from '../../dynamodb'
import { AttributeMetadata } from '../attribute'

type Type = DynamoDB.BinarySetAttributeValue

export interface BinarySetAttributeMetadata extends AttributeMetadata<Type> {
}
