# twilio-tools

Snippet of code to help CAA

Docs are admittedly lacking!

## Setup Steps

1. Make sure you have Node.js as well as npm installed

   - npm version 5.0.0 or later (type `npm -v` in your terminal to check)
   - Node.js version 12 or later (type `node -v` in your terminal to check)

2. Clone this repository

```
git clone https://github.com/jyates/twilio-tools.git
```

3. Install dependencies

```
npm install
```

4. Make a copy of `.env.example`

   ```bash
   cp .env.example .env
   ```

5. Open `.env` with your text editor and set the environment variables mentioned in the file. Not all are relevant for all scripts, but Account SID, Auth Token, and Flex Proxy Service SID will be the bare minimum.

   ```
   TWILIO_ACCT_SID=ACXXX
   TWILIO_ACCT_AUTH=XXX
   TWILIO_WORKSPACE_SID=WSXXX
   TWILIO_CHAT_SERVICE_SID=ISXXX
   ```

## Proxy: Sessions

`/scripts/proxy/flexProxySessions.js`

Uses the Proxy Sessions API to create or modify the status on Flex Proxy Sessions.

```
npm run twilio:proxy:sessions --
```

### Examples

Create the specified number of Flex Proxy Sessions.  Useful for testing.  NOTE: Sessions will be 'empty' - no participants.

```
npm run twilio:proxy:sessions -- --createSessions=10
```

Update ALL sessions to the indicated status value.  The only acceptable options are 'closed' or 'in-progress' - the API will return errors for any other value.

```
npm run twilio:proxy:sessions -- --newStatus=closed
```

## Conversations: Conversations

`/scripts/conversations/conversations.js`

Uses the Conversations API to list or delete Conversations resources.

```
npm run twilio:conversations:conversations --
```

### Examples

List all existing Conversations resources in the account.  Useful for testing.

```
npm run twilio:conversations:conversations --
```

Delete ALL conversation resources.  This operation cannot be undone.

```
npm run twilio:prconversationsoxy:conversations -- --deleteAll=true
```
