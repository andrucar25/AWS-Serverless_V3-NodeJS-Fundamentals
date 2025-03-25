import {PublishCommandInput, PublishCommand, SNSClient} from "@aws-sdk/client-sns";

const client = new SNSClient({ region: "us-east-1" });

const execute = async (event) => {
  const body = event.body

  const params: PublishCommandInput = {
    TopicArn: "arn:aws:sns:us-east-1:310860165518:origen-topic",
    Message: body
  };

  const command = new PublishCommand(params);
  await client.send(command);

  return { statusCode: 200, body: "Hola" };

};

export const main = execute;
