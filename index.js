import dotenv from "dotenv";
import { VapiClient, VapiError } from "@vapi-ai/server-sdk";

dotenv.config();

const client = new VapiClient({ token: process.env.VAPI_TOKEN });

async function main() {
  const target = process.env.TARGET_NUMBER;
  if (!target) throw new Error("Set TARGET_NUMBER in your .env");

  try {
    // 1) Create the assistant and grab its id
    const createResp = await client.assistants.create({
      name: "OutboundDialerAssistantV3",
      model: {
        provider: "openai",
        //model: "gpt-4o-mini-realtime-preview-2024-12-17"
        model: "gpt-4o"
      },
      voice: {
        provider: "11labs",
        voiceId: "HbE0EqRqg133Y96c3qXU"
      }
    });
    const assistantId = createResp.id;

    // 2) Dial out to your number using that assistant ID
    const callResp = await client.calls.create({
      //assistantId: assistantId, 
      phoneNumberId: "eb10c951-0f0c-4829-b9c8-1dc02d186027",
      customers: [
        {
          number: target,
        },
      ],
      workflowId: "00cea89c-2651-4fef-91ea-b15d5e2f082b"
    });
    console.log("Outbound call initiated:", callResp);
  } catch (err) {
    if (err instanceof VapiError) {
      console.error("VAPI error:", err.statusCode, err.message, err.body);
    } else {
      console.error(err);
    }
  }
}

function workflow() {
  const workflowId = '00cea89c-2651-4fef-91ea-b15d5e2f082b'
  const apiKey = process.env.VAPI_TOKEN;

  fetch(`https://api.vapi.ai/workflow/${workflowId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      console.log("workflow", data);
    })
    .catch((err) => {
      console.error("Request failed:", err);
    });
}

//workflow();

main();
