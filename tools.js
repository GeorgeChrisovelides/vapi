import dotenv from "dotenv";
import { VapiClient, VapiError } from "@vapi-ai/server-sdk";

dotenv.config();

const client = new VapiClient({ token: process.env.VAPI_TOKEN });

async function transferTool() {
  const toolCall = await client.tools.create({
    type: "transferCall",
    destinations: [
      {
        type: "number",
        number: "+441502806010",
        transferPlan: {
          mode: "warm-transfer-with-summary",
          summaryPlan: {
            enabled: true,
            messages: [
              {
                role: "system",
                content:
                  "Please provide a summary of the call. Include the name of the customer, as well as any questions they had.",
              },
              {
                role: "user",
                content: "Here is the transcript:\n\n{{transcript}}\n\n.",
              },
            ],
          },
        },
      },
    ],
  });
}
