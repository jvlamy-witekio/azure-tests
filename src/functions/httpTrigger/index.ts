import { EventHubProducerClient } from "@azure/event-hubs";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";
import { Pool } from "pg";

function getBlobServiceClient(): BlobServiceClient {
  const storageAccountConnectionString = process.env.STORAGE_ACCOUNT_CONNECTION_STRING;
  const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;

  if (!storageAccountConnectionString && !storageAccountName) {
    throw new Error("Missing storage account configuration");
  }

  if (storageAccountConnectionString) {
    return BlobServiceClient.fromConnectionString(storageAccountConnectionString);
  } else {
    return new BlobServiceClient(`https://${storageAccountName}.blob.core.windows.net`, new DefaultAzureCredential());
  }
}

function getEventHubProducerClient(): EventHubProducerClient {
  const eventHubConnectionString = process.env.EVENT_HUB_CONNECTION_STRING;
  const eventHubConnection = process.env.EVENT_HUB_CONNECTION__fullyQualifiedNamespace;
  const eventHubName = process.env.EVENT_HUB_NAME;

  if (!eventHubConnectionString && !eventHubConnection) {
    throw new Error("Missing event hub namespace configuration");
  }

  if (!eventHubName) {
    throw new Error("Missing event hub configuration");
  }

  if (eventHubConnectionString) {
    return new EventHubProducerClient(eventHubConnectionString, eventHubName);
  } else {
    return new EventHubProducerClient(eventHubConnection!, eventHubName, new DefaultAzureCredential());
  }
}

async function readBlobs(): Promise<string[]> {
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
  return blobs;
}

async function sendToEventHub(param: unknown): Promise<void> {
  const eventHubProducerClient = getEventHubProducerClient();
  const batch = await eventHubProducerClient.createBatch({});
  batch.tryAdd({ body: param });
  await eventHubProducerClient.sendBatch(batch);
  await eventHubProducerClient.close();
}

async function readDatabase(): Promise<unknown> {
  if (!process.env.PGHOST || !process.env.PGDATABASE || !process.env.PGUSER || !process.env.PGPASSWORD) {
    throw new Error("Missing database configuration");
  }

  const pool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT ?? 5432),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10, // Simultaneous connections
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  return await pool.query("SELECT now()");
}

export async function httpTrigger(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    context.log(`Log!`);
    context.debug(`Debug!`);
    context.info(`Info!`);
    context.warn(`Warning!`);
    context.error(`Error!`);

    const blobs = await readBlobs();

    const param = request.query.get("param") ?? "no-param";
    await sendToEventHub(param);

    const result = await readDatabase();
    context.log(`readDatabase result "${JSON.stringify(result)}"`);

    return {
      status: 200,
      jsonBody: {
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
  handler: httpTrigger,
});
