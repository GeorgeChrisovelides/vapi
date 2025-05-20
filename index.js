import dotenv from "dotenv";
import { VapiClient, VapiError } from "@vapi-ai/server-sdk";
import fs from "fs";
import path from "path";

dotenv.config();

const client = new VapiClient({ token: process.env.VAPI_TOKEN });

async function main() {
  const customersData = loadCustomerData();
  const assistantId = "33ed4652-9db0-4894-8228-0d67a2d32e49";

  for (const customer of customersData) {
    try {
      const callResp = await client.calls.create({
        assistantId: assistantId,
        assistantOverrides: {
          variableValues: {
            first_name: customer.Name,
            enquiry_type: customer.enquiryType,
            enquiry_date: customer.enquiryDate,
          },
        },
        phoneNumberId: "eb10c951-0f0c-4829-b9c8-1dc02d186027",
        customers: [
          {
            number: customer.Number,
          },
        ],
      });
      console.log("Outbound call initiated:", callResp);
      console.log("Polling for end of call")

      //Is this the best way to call this func below? does it need timing?

      handleCallsEnd()

    } catch (err) {
      if (err instanceof VapiError) {
        console.error("VAPI error:", err.statusCode, err.message, err.body);
      } else {
        console.error(err);
      }
    }
  }
}

function loadCustomerData() {
  const filePath = path.join(process.cwd(), "test_data.json");
  const fileData = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileData);
}

async function getMostRecentCallId() {
  const assistantId = "33ed4652-9db0-4894-8228-0d67a2d32e49";

  const response = await client.calls.list({
    assistantId: assistantId,
  });

  const callId = response[0].id;
  return callId;
}

async function handleCallsEnd() {
  const callId = await getMostRecentCallId();
  const response = await client.calls.get(callId);

  const callStatus = response.status;
  const callSummary = response.summary;
  const capsuleId = response.assistantOverrides.variableValues.capsule_id;
  const callEndReason = response.endedReason;

  if (callStatus != "ended") {
    setTimeout(() => {
      handleCallsEnd();
    }, 1000);
  }

  if (callStatus === "ended") {
    sendDataToCapsule(callSummary, capsuleId, callEndReason);
  }
}

async function sendDataToCapsule(summary, capsuleId, endReason) {
  const apiUrl = "https://api.capsulecrm.com/api/v2/entries";
  const apiKey = process.env.CAPSULE_API_KEY;

  const body = {
    type: "note",
    content: { callSummary: summary, callEndReason: endReason },
    activityType: -1,
    party: { id: capsuleId },
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Error ${response.status}: ${response.statusText} – ${
        err.message || JSON.stringify(err)
      }`
    );
  }

  const { entry } = await response.json();
  console.log("Added to capsule:", entry);
  return entry;
}

//main();
