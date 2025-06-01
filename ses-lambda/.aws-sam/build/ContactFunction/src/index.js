import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Read these from environment variables in the Lambda console:
const REGION = process.env.AWS_REGION;
const FROM   = (process.env.FROM_EMAIL || '').trim(); // e.g. 'raaztutoring@gmail.com'
const TO     = (process.env.TO_EMAIL || '').trim();   // e.g. 'raaztutoring@gmail.com'

// Log them on cold start to confirm they’re set:
console.log('Lambda Init - REGION:', REGION);
console.log('Lambda Init - FROM_EMAIL:', FROM);
console.log('Lambda Init - TO_EMAIL:', TO);

const ses = new SESClient({ region: REGION });

export const handler = async (event) => {
  try {
    // Parse name, email, phone, message from request body
    const { name, email, phone, message } = JSON.parse(event.body || '{}');

    // Build the SES params, including "Source"
    const params = {
      Destination: {
        ToAddresses: [TO],
      },
      Source: FROM,
      Message: {
        Subject: {
          Data: `New Contact Form Message from ${name}`,
        },
        Body: {
          Text: {
            Data: `You received a new message from your website contact form:

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}`,
          },
        },
      },
    };

    // Log the params to verify “Source” and content:
    console.log('SES SendEmailCommand Params:', JSON.stringify(params, null, 2));

    // Send the email
    await ses.send(new SendEmailCommand(params));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',            // CORS header
        'Access-Control-Allow-Headers': 'Content-Type', // Preflight allowance
      },
      body: JSON.stringify({ status: 'OK' }),
    };
  } catch (err) {
    console.error('SES send error:', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Failed to send email' }),
    };
  }
};
