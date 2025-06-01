import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Read these from environment variables in Lambda console
const REGION = process.env.AWS_REGION;
const FROM   = (process.env.FROM_EMAIL).trim(); // e.g. 'raaztutoring@gmail.com'
const TO     = process.env.TO_EMAIL;   // e.g. 'raaztutoring@gmail.com'

// >>> ADD THESE console.log STATEMENTS <<<
console.log('Lambda Init - REGION:', REGION);
console.log('Lambda Init - FROM_EMAIL:', FROM);
console.log('Lambda Init - TO_EMAIL:', TO);
// >>> END ADDITIONS <<<

const ses = new SESClient({ region: REGION });

export const handler = async (event) => {
  try {
    const { name, email, message } = JSON.parse(event.body || '{}');

    const params = {
      Destination: { ToAddresses: [TO] },
      Source: FROM,
      Message: {
        Subject: { Data: `New Contact Form Message from ${name}` },
        Body: {
          Text: {
            Data:
`You received a new message from your website contact form:

Name: ${name}
Email: ${email}

Message:
${message}`
          }
        }
      }
    };

    // >>> ADD THIS LINE <<<
    console.log('SES SendEmailCommand Params:', JSON.stringify(params, null, 2));

    await ses.send(new SendEmailCommand(params));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",            // <<< CORS header
        "Access-Control-Allow-Headers": "Content-Type" // <<< preflight allowance
      },
      body: JSON.stringify({ status: "OK" })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ error: "Failed to send email" })
    };
  }
};
