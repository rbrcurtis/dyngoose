import { DynamoDB } from '../dynamodb'
import { Connection } from './connection'

export class DAXConnection implements Connection {
  constructor(options: {
    endpoints: string[]
    requestTimeout?: number
  }) {
    throw new Error('DAXConnection is not available after migrating dyngoose to AWS SDK v3')
  }

  public get client(): DynamoDB {
    throw new Error('DAXConnection is not available after migrating dyngoose to AWS SDK v3')
  }
}
