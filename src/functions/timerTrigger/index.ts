import { app, InvocationContext, Timer } from "@azure/functions";

export async function timerTrigger(
  myTimer: Timer,
  context: InvocationContext,
): Promise<void> {
  context.log("Timer function processed request 10.");
}

app.timer("timerTrigger", {
  schedule: "* */10 * * * *",
  runOnStartup: true,
  handler: timerTrigger,
});
