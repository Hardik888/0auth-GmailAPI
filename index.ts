import { listLabels, listMessages, sendEmail } from "./gmailApiServices";
import { authorize } from "./googleauthservice";

async function init() {
  let auth: any = await authorize().then().catch(console.error);
  let message =
    "TO: hardik89990@gmail.com\n" +
    "Subject: Test Email" +
    "Content-Type:text/html; charset=utf-8\n\n" +
    "Hello World";

  await listMessages(auth).catch(console.error);
}
init().catch(console.error);
