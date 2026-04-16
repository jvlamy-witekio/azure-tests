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

export async function httpTrigger(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    context.log(`Http function processed request for url "${request.url}"`);

    const storageAccountName = process.env["STORAGE_ACCOUNT_NAME"];
    const containerName = process.env["STORAGE_CONTAINER_NAME"];
    // const managedIdentityClientId = process.env["UAMI_CLIENT_ID"];

    if (!storageAccountName || !containerName) {
      return {
        status: 500,
        body: "Missing configuration",
      };
    }

    const credential = new DefaultAzureCredential();

    const blobServiceClient = new BlobServiceClient(
      `https://${storageAccountName}.blob.core.windows.net`,
      credential,
    );

    const containerClient = blobServiceClient.getContainerClient(containerName);
    // await containerClient.getProperties();

    // Itérateur async → performant
    const blobs: string[] = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      blobs.push(blob.name);
    }

    return {
      status: 200,
      jsonBody: {
        container: containerName,
        count: blobs.length,
        blobs,
        status: "ok",
      },
    };
  } catch (error) {
    context.log(`Error: ${error}`);
    return { status: 500, body: `${error}` };
  }
}

app.http("httpTrigger", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  // extraOutputs: [sendToQueue],
  handler: httpTrigger,
});
