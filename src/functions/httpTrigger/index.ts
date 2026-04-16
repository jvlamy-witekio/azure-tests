import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";

// const sendToQueue = output.eventHub({
//   connection: "EventHubConnection",
//   eventHubName: "eh1",
// });

function getBlobServiceClient(): BlobServiceClient {
  const storageAccountConnectionString =
    process.env["STORAGE_ACCOUNT_CONNECTION_STRING"];
  const storageAccountName = process.env["STORAGE_ACCOUNT_NAME"];

  if (!storageAccountConnectionString && !storageAccountName) {
    throw new Error("Missing configuration");
  }

  if (storageAccountConnectionString) {
    return BlobServiceClient.fromConnectionString(
      storageAccountConnectionString,
    );
  } else {
    return new BlobServiceClient(
      `https://${storageAccountName}.blob.core.windows.net`,
      new DefaultAzureCredential(),
    );
  }
}

export async function httpTrigger(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    context.log(`Http function processed request for url "${request.url}"`);

    const blobServiceClient = getBlobServiceClient();
    const containerClient = blobServiceClient.getContainerClient("assets");
    const containerExists = await containerClient.exists();
    if (!containerExists) {
      await blobServiceClient.createContainer(containerClient.containerName);
    }

    const blobs: string[] = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      blobs.push(blob.name);
    }

    return {
      status: 200,
      jsonBody: {
        container: containerClient.containerName,
        blobs,
      },
    };
  } catch (error) {
    return { status: 500, body: `${error}` };
  }
}

app.http("httpTrigger", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  // extraOutputs: [sendToQueue],
  handler: httpTrigger,
});
