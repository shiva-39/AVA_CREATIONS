// Download the helper library from https://www.twilio.com/docs/node/install
const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";
require('dotenv').config();
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function createCall() {
  const call = await client.calls.create({
    from: "+16573410115",
    to: "+919948068484",
    url: "https://58df-167-103-118-170.ngrok-free.app/voice",
  });

  console.log(call.sid);
}

createCall();