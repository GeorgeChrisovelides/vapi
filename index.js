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

async function capsuleFetch() {
  const apiUrl =
    "https://api.capsulecrm.com/api/v2/opportunities?since=2025-05-19T00:00:00Z";
  const apiKey = process.env.CAPSULE_API_KEY;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch tasks: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const opportunities = data.result ? data.result.opportunities : data.opportunities;
  const firstOpportunity = opportunities ? opportunities[0] : undefined;
  console.log("response", firstOpportunity);
}

capsuleFetch()

//main();
