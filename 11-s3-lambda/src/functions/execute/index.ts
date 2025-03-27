import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: "bucket-event-s3-lambda",
        event: "s3:ObjectCreated:*",
        existing: true,
        rules: [
          { prefix: "patients-news/"}
        ],
      },
    },
  ],
};
