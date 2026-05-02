import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const endpoint = process.env.DYNAMODB_ENDPOINT;

export const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  endpoint,
  credentials: endpoint
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "local",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "local"
      }
    : undefined
});

export const documentClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true
  }
});

export const tableName = process.env.DYNAMODB_TABLE_NAME ?? "condoledger-local";
