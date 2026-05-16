import { DynamoDB } from '../../dynamodb';
import { AttributeMetadata } from '../attribute';
declare type Type = DynamoDB.BinarySetAttributeValue;
export interface BinarySetAttributeMetadata extends AttributeMetadata<Type> {
}
export {};
