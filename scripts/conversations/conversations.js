require("dotenv").config();
const fs = require("fs");
const Twilio = require("twilio");
const args = require('yargs')(process.argv.slice(2))
    .string('deleteAll')
    .usage('Usage: $0 --deleteAll=true|false')
    .describe('deleteAll', '(Optional) Is false if not provided. Deletes all Conversations Resources')
    .default('deleteAll', "false")
    .argv;

const accountSid = process.env.TWILIO_ACCT_SID;
const authToken = process.env.TWILIO_ACCT_AUTH;
const proxySid = process.env.TWILIO_FLEX_PROXY_SERVICE_SID;
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

async function outputConversations() {

    // Get all conversations
    const conversations = await await client
        .conversations.v1.conversations
        .list();

    console.log(`Found ${conversations.length} total conversations.`);
    
    let errorCount = 0;

    // Use for loop to sequentially create sessions
    // (slow, but avoids hammering API and getting 'Too many requests' errors)
    for(let x=0; x < conversations.length; x++) {
        try {
            const conversation = await client
                .conversations.v1.conversations(conversations[x].sid)
                .fetch(conversations[x].sid);
            console.log("Conversation: ", conversation.sid, conversation.friendlyName)
        }
        catch(e) {
            errorCount++;
        }
    }
    console.log(`Output ${conversations.length} conversations, with ${errorCount} errors.`);
    return conversations;
}


const deleteAll = args.deleteAll;

outputConversations().then(convoList =>{
    console.log(convoList);
    if(deleteAll == "true") {
        deleteConversations(convoList);
    }    
});

