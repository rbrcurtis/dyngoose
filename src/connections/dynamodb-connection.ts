import { NodeHttpHandler } from '@smithy/node-http-handler'
import { Agent as HTTPAgent } from 'http'
import { Agent as HTTPSAgent } from 'https'
import { DynamoDB, type DynamoDBConfig } from '../dynamodb'
import { Connection } from './connection'

interface DyngooseDynamoDBConnectionOptions extends DynamoDBConfig {
  enableAWSXray?: boolean
}

export class DynamoDBConnection implements Connection {
  private readonly __client: DynamoDB

  constructor(options: DyngooseDynamoDBConnectionOptions) {
    const { enableAWSXray: _, ...config } = options
    const httpAgent = this.httpAgent(typeof options.endpoint === 'string' ? options.endpoint : undefined)
    config.requestHandler = new NodeHttpHandler({
      httpAgent: httpAgent instanceof HTTPAgent ? httpAgent : undefined,
      httpsAgent: httpAgent instanceof HTTPSAgent ? httpAgent : undefined,
    })

    this.__client = new DynamoDB(config)
  }

  private httpAgent(endpoint: string | undefined): HTTPAgent | HTTPSAgent {
    if (typeof endpoint === 'string' && endpoint.startsWith('http://')) {
      return new HTTPAgent({
        keepAlive: true,
      })
    } else {
      return new HTTPSAgent({
        rejectUnauthorized: true,
        keepAlive: true,
      })
    }
  }

  public get client(): DynamoDB {
    return this.__client
  }
}
