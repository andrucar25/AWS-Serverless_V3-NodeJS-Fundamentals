import { EventBridgeService } from "./eventbridge.service";

const execute = async (event: any) => {
  const body = event.body;

  const service = new EventBridgeService();
  await service.put(
    body,
    "appointment-medic",
    "appointment-scheduled",
    "origen-event-bus"
  );


  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "EventBridge event sent",
      ...JSON.parse(body),
    }),
  };
};

export const main = execute;
