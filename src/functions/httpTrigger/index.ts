import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

// const sendToQueue = output.eventHub({
//   connection: "EventHubConnection",
//   eventHubName: "eh1",
// });

export async function httpTrigger(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    context.log(`Http function processed request for url "${request.url}"`);

    const name = request.query.get("name") || (await request.text());
    context.log(`Name: ${name}`);

    if (name) {
      const msg = `Name passed to the function ${name}`;
      // context.extraOutputs.set(sendToQueue, { body: msg });
      return { body: msg };
    } else {
      context.log("Missing required data");
      return { status: 404, body: "Missing required data" };
    }
  } catch (error) {
    context.log(`Error: ${error}`);
    return { status: 500, body: "Internal Server Error" };
  }
}

app.http("httpTrigger", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  // extraOutputs: [sendToQueue],
  handler: httpTrigger,
});
