import express, { Application, NextFunction, Request, Response } from "express";
import { listLabels, listMessages, sendEmail } from "./gmailApiServices";
import { authorize } from "./googleauthservice";

const app: Application = express();

async function init() {
  try {
    // Authorization
    let auth: any = await authorize().then().catch();

    // Express App Configuration
    app.use(express.json());

    // Route Handlers
    app.get("/api/labels", async (req, res) => {
      try {
        const labels = await listLabels(auth);
        res.json(labels);
      } catch (error) {
        res.status(500).send(
          `Error Fetching Labels${{
            Error: error,
          }}`
        );
      }
    });

    app.post("/api/send-email", async (req, res) => {
      const { content } = req.body;
      try {
        const response = await sendEmail(auth, content);

        return res.json({
          message: "Email Sent Successfuly",
          response: response,
        });
      } catch (error) {
        res.status(500).send(
          `Error Sending Email${{
            Error: error,
          }}`
        );
      }
    });

    app.get("/api/get-messages", async (req, res) => {
      try {
        const messages = await listMessages(auth);
        return res.send(messages).status(200);
      } catch (error) {
        res.status(500).send(
          `Error Getting Mails${{
            Error: error,
          }}`
        );
      }
    });

    // Start Server
    app.listen(3000, () => {
      console.log(`Server listening on port 3000`);
    });
  } catch (error) {
    console.error("Error initializing server:", error);
  }
}

init();

// import { listLabels, listMessages, sendEmail } from "./gmailApiServices";
// import { authorize } from "./googleauthservice";

// async function init() {
//   let auth: any = await authorize().then().catch(console.error);
//   let message =
//     "TO: hardik89990@gmail.com\n" +
//     "Subject: Test Email" +
//     "Content-Type:text/html; charset=utf-8\n\n" +
//     "Hello World";

//   await listMessages(auth).catch(console.error);
// }
// init().catch(console.error);
