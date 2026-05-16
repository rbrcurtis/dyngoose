import { DynamoDB } from '../../dynamodb';
import { AttributeMetadata } from '../attribute';
declare type Type = DynamoDB.BinaryAttributeValue;
export interface BinaryAttributeMetadata extends AttributeMetadata<Type> {
}
export {};
