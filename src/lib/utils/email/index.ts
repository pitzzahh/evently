import type { EmailObject, SendEmailBody } from "@/types/email";

export async function sendEmail(body: SendEmailBody) {
  const response = await fetch(`${import.meta.env.VITE_PLUNK_API}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${import.meta.env.VITE_PLUNK_API_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Error sending email: ${response.statusText}`);
  }

  const data = await response.json() as EmailObject;
  return data;
}