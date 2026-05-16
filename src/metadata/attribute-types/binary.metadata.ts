import { DynamoDB } from '../../dynamodb'
import { AttributeMetadata } from '../attribute'

type Type = DynamoDB.BinaryAttributeValue

export interface BinaryAttributeMetadata extends AttributeMetadata<Type> {
}
