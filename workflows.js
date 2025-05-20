import dotenv from "dotenv";
import { VapiClient, VapiError } from "@vapi-ai/server-sdk";

dotenv.config();

const client = new VapiClient({ token: process.env.VAPI_TOKEN });

function workflow() {
  const workflowId = "00cea89c-2651-4fef-91ea-b15d5e2f082b";
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
