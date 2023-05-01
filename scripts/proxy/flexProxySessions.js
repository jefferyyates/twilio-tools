require("dotenv").config();
const fs = require("fs");
const Twilio = require("twilio");
const args = require('yargs')(process.argv.slice(2))
    .number('createSessions')
    .string('newStatus')
    .usage('Usage: $0 --createSessions=X --newStatus=in-progress|closed')
    .describe('createSessions', '(Optional) Number of (empty) proxy sessions to create')
    .describe('newStatus', '(Optional) New status value (either in-progress or closed) to set on all sessions')
    .default('createSessions', 0)
    .argv;

const accountSid = process.env.TWILIO_ACCT_SID;
const authToken = process.env.TWILIO_ACCT_AUTH;
const proxySid = process.env.TWILIO_FLEX_PROXY_SERVICE_SID;
const client = Twilio(accountSid, authToken);

function createSessions(numSessions) {
    // Use for loop to sequentially create sessions
    // (slow, but avoids hammering API and getting 'Too many requests' errors)
    for (let i = 0; i < numSessions; i++) {
        client
            .proxy.v1.services(proxySid)
            .sessions
            .create();
    }
    console.log("+", numSessions, "created +");
}

async function outputSessions(newStatus, filename) {
    filename = !!filename ? filename : "output.csv";

    const doStatusUpdate = !!newStatus;

    //console.log(`Output file will be: ${filename}`);

    // Get all sessions
    const sessions = await getSessions();
    let errorCount = 0;

    console.log(`Found ${sessions.length} total sessions.`);

    if(doStatusUpdate) {
        console.log(`Updating ${sessions.length} chat sessions...`);

        // Use for loop to sequentially create sessions
        // (slow, but avoids hammering API and getting 'Too many requests' errors)
        for(let x=0; x < sessions.length; x++) {
            try {
                await client
                    .proxy.v1.services(proxySid)
                    .sessions(sessions[x].sid)
                    .update({
                        status: newStatus
                    });
            }
            catch(e) {
                errorCount++;
            }
        }
        console.log(`Completed ${sessions.length} chat session updates, with ${errorCount} errors.`);
    }
}


/**
 * Gets the Proxy Sessions
 */
async function getSessions() {
    // Get all sessions
    let sessions = await client
    .proxy.v1.services(proxySid)
        .sessions
        .list()
        .then();
    return sessions;
}

const numSessions = args.createSessions;
const newStatus = args.newStatus;

if(numSessions > 0) {
    createSessions(numSessions);
}
outputSessions(newStatus);
