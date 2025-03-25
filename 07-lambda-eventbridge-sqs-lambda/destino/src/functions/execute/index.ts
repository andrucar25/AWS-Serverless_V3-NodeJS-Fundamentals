import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      sqs: "arn:aws:sqs:us-east-1:310860165518:origen-queue-eventbridge",
    },
  ],
};
