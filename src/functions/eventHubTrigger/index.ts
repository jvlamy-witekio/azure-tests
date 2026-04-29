import { app, InvocationContext } from "@azure/functions";

export async function eventHubTrigger(messages: unknown | unknown[], context: InvocationContext): Promise<void> {
  context.log(`eventHubTrigger function processed request with messages "${messages}"`);

  if (Array.isArray(messages)) {
    context.log(`Event hub function processed ${messages.length} messages`);
    for (const message of messages) {
      context.log("Event hub message:", message);
    }
  } else {
    context.log("Event hub function processed message:", messages);
  }
}

app.eventHub("eventHubTrigger", {
  connection: "EVENT_HUB_CONNECTION_STRING",
  eventHubName: process.env.EVENT_HUB_NAME!,
  consumerGroup: "eventHubTrigger",
  cardinality: "many",
  handler: eventHubTrigger,
});
