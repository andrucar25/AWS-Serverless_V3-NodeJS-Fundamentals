import {DynamoDBClient, QueryCommand, QueryCommandInput} from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });

const execute = async (event: any) => {
  const input: QueryCommandInput = {
    TableName: "Pedidos",
    ExpressionAttributeValues: {
      ":v1": {
        S: "user1@gmail.com",
      },
    },
    KeyConditionExpression: "email = :v1",
  };

  const query = new QueryCommand(input);
  const response = await client.send(query);

  return {
    statusCode: 200,
    body: JSON.stringify(response.Items),
  };
};

export const main = execute;
