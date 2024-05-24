import { google, gmail_v1 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { decode } from "html-entities";
/**
 * Lists the labels in the user's account.
 *
 * @param {OAuth2Client} auth An authorized OAuth2 client.
 * @return {Promise<gmail_v1.Schema$Label[]>} A promise that resolves to an array of labels.
 */
async function listLabels(
  auth: OAuth2Client
): Promise<gmail_v1.Schema$Label[]> {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.labels.list({
    userId: "me",
  });

  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log("No labels found.");
    return [];
  }

  console.log("Labels:");
  labels.forEach((label) => {
    console.log(`- ${label.name}`);
  });

  return labels;
}

/**
 * Lists the latest message in the user's account.
 *
 * @param {OAuth2Client} auth An authorized OAuth2 client.
 * @return {Promise<string>} A promise that resolves to the body of the latest message.
 */
async function listMessages(auth: OAuth2Client): Promise<string> {
  const gmail = google.gmail({ version: "v1", auth });

  try {
    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });
    console.log(res);
    if (!res.data.messages || res.data.messages.length === 0) {
      console.log("No messages found.");
      return "";
    }

    const latestMessageId = res.data.messages[0].id;
    console.log("Latest Message ID:", latestMessageId);

    const message = await gmail.users.messages.get({
      userId: "me",
      id: latestMessageId || "",
    });

    // Decode HTML entities in the snippet
    const snippet = decode(message.data.snippet);

    console.log("Message Snippet:", snippet);

    const payload = message.data.payload;
    if (!payload) {
      console.log("No payload found in the message.");
      return "";
    }

    const parts = payload.parts;
    if (!parts || parts.length === 0) {
      console.log("No message parts found.");
      return "";
    }

    // Find the part with content-type text/plain
    const textPart = parts.find((part) => part.mimeType === "text/plain");
    if (!textPart) {
      console.log("No text/plain part found.");
      return "";
    }

    const body = textPart.body?.data;
    if (!body) {
      console.log("No message body found.");
      return "";
    }

    const mailBody = `${snippet}\n\n${Buffer.from(body, "base64").toString()}`;
    console.log("Message Body:", mailBody);
    return mailBody;
  } catch (error) {
    console.error("Error fetching message:", error);
    return "";
  }
}

/**
 * Sends an email.
 *
 * @param {OAuth2Client} auth An authorized OAuth2 client.
 * @param {string} content The content of the email to send.
 * @return {Promise<gmail_v1.Schema$Message>} A promise that resolves to the sent message.
 */
async function sendEmail(
  auth: OAuth2Client,
  content: string
): Promise<gmail_v1.Schema$Message> {
  const gmail = google.gmail({ version: "v1", auth });
  const encodedMessage = Buffer.from(content)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  console.log(res.data);
  return res.data;
}

export { listLabels, listMessages, sendEmail };
