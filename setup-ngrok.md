# Setup Instructions for IVR System

## Prerequisites

1. Install ngrok to expose your local server to the internet:
   - Go to https://ngrok.com/
   - Sign up for a free account
   - Download and install ngrok
   - Authenticate ngrok with your token

## Steps to Run the IVR System

1. **Start your Express server:**

   ```bash
   cd server
   node index.js
   ```

   Your server should be running on port 5000 (or the port specified in your .env file)

2. **In a new terminal, start ngrok:**

   ```bash
   ngrok http 5000
   ```

   This will give you a public URL like `https://abc123.ngrok.io`

3. **Update ivr.js with your ngrok URL:**
   Replace `"https://your-ngrok-url.ngrok.io/voice"` in `ivr.js` with your actual ngrok URL

4. **Test your IVR:**
   ```bash
   node ivr.js
   ```

## IVR Menu Options

When someone calls, they will hear:
"Welcome to our IVR system. Press 1 for customer support, press 2 for billing information, or press 3 for technical support."

- **Press 1**: Customer support - plays hold music
- **Press 2**: Billing information - provides account balance and next billing date
- **Press 3**: Technical support - allows caller to record a message (30 seconds max)

## Customizing Responses

You can modify the responses in `server/index.js` in the `/voice/menu` endpoint. Each case (1, 2, 3) can be customized with different:

- Text-to-speech messages
- Music/audio files
- Recording functionality
- Call redirections
- And more!
