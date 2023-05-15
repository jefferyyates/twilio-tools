require("dotenv").config();
const fs = require("fs");
const Twilio = require("twilio");
const args = require('yargs')(process.argv.slice(2))
    .string('participant')
    .usage('Usage: $0 --participant=+19999999999')
    .describe('participant', '(Required) The phone number idendifying a participant')
    .argv;

const accountSid = process.env.TWILIO_ACCT_SID;
const authToken = process.env.TWILIO_ACCT_AUTH;
const client = Twilio(accountSid, authToken);

async function deleteConversations(conversationList) {
    // Use for loop to sequentially create sessions
    // (slow, but avoids hammering API and getting 'Too many requests' errors)
    for (let i = 0; i < conversationList; i++) {
        await client
            .conversations
            .v1
            .conversations(conversationList[i].sid)
            .remove();
    }
    console.log("+", conversationList.length, "deleted +");
}

async function outputParticipantConversations(participant) {

    // Get all conversations for a participant
    const conversations = await client
        .conversations
        .v1
        .participantConversations
        .list({address: participant});

    let errorCount = 0;

    // Use for loop to sequentially fetch info
    // (slow, but avoids hammering API and getting 'Too many requests' errors)
    for(let x=0; x < conversations.length; x++) {
        try {
            const conversation = await client
                .conversations
                .v1
                .conversations(conversations[x].conversationSid)
                .fetch();
            console.log("Conversation: ", conversation.sid, conversation.state, conversation.friendlyName)
        }
        catch(e) {
            errorCount++;
        }
    }
    console.log(`Output ${conversations.length} conversations, with ${errorCount} errors.`);
    return conversations;
}


const participant = args.participant;

outputParticipantConversations(participant).then(convoList =>{
    console.log("Found", convoList.length, "conversations for", participant);
//    if(deleteAll == "true") {
//        deleteConversations(convoList);
//    }    
});
