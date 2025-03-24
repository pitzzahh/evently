export type SendEmailBody = {
  to: string | string[]; // A single email address or an array of email addresses
  subject: string; // The subject of the email
  body: string; // The body of the email
  subscribed?: boolean; // Should the contact be subscribed, defaults to false
  name?: string; // Override the name of the sender. Defaults to the project name
  from?: string; // Override the email of the sender. Defaults to your verified email
  reply?: string; // Override the reply-to address
  headers?: EmailHeaders; // Additional headers to include in the email
}

export type EmailHeaders = {
  'Content-Type': string; // Required, application/json
  [key: string]: string; // Allow for additional headers
}

export type EmailObject = {
  contact: {
    id: string;      // The ID of the contact
    email: string;   // The email of the contact
  },
  email: string; // The ID of the email (renamed from duplicate "email" field in spec)
}

export type EmailResponse = {
  success: boolean; // Indicates whether the call was successful
  emails: EmailObject; // Email Object
  timestamp: string | Date; // The timestamp of the event
}