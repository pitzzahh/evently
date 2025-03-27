import type { EmailObject, SendEmailBody } from "@/types/email";

export async function sendEmail(body: SendEmailBody, options: {
  PLUNK_API: string;
  PLUNK_SK: string;
}) {
  const response = await fetch(`${options.PLUNK_API}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${options.PLUNK_SK}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Error sending email: ${response.statusText}`);
  }

  const data = await response.json() as EmailObject;
  return data;
}