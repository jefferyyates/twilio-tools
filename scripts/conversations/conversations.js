require("dotenv").config();
const fs = require("fs");
const Twilio = require("twilio");
const args = require('yargs')(process.argv.slice(2))
    .string('deleteAll')
    .string('setStatusAll')
    .usage('Usage: $0 --deleteAll=true|false --setStatusAll=closed|inactive|active')
    .describe('deleteAll', '(Optional) Is false if not provided. Deletes all Conversations Resources')
    .default('deleteAll', "false")
    .describe('setStatusAll', '(Optional) New status value for all conversations (closed|inactive|active)')
    .argv;

const accountSid = process.env.TWILIO_ACCT_SID;
const authToken = process.env.TWILIO_ACCT_AUTH;
const client = Twilio(accountSid, authToken);

async function updateConversationStatus(conversationList, newStatus) {
    // Use for loop to sequentially create sessions
    // (slow, but avoids hammering API and getting 'Too many requests' errors)
    let updatedCount = 0;
    for (let i = 0; i < conversationList.length; i++) {

        if(conversationList[i].state != 'closed') {
            console.log("updating", conversationList[i].sid, conversationList[i].state, "->", newStatus);
            await client
                .conversations
                .v1
                .conversations(conversationList[i].sid)
                .update({state: newStatus});
            updatedCount++
        }
    }
    console.log("+", updatedCount, "updated +");
}

async function deleteConversations(conversationList) {
    // Use for loop to sequentially create sessions
    // (slow, but avoids hammering API and getting 'Too many requests' errors)
    let removedCount = 0;

    for (let i = 0; i < conversationList.length; i++) {
        console.log("removing", conversationList[i].sid, i);

        await client
            .conversations
            .v1
            .conversations(conversationList[i].sid)
            .remove();

        removedCount++;
    }
    console.log("+", removedCount, "deleted +");
}

async function outputConversations() {

    // Get all conversations
    const conversations = await client
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
                .fetch();
            console.log("Conversation: ", conversation.sid, conversation.state)
        }
        catch(e) {
            errorCount++;
        }
    }
    console.log(`Output ${conversations.length} conversations, with ${errorCount} errors.`);
    return conversations;
}


const deleteAll = args.deleteAll;
const newStatus = args.setStatusAll;

outputConversations().then(convoList =>{
    if(newStatus) {
        updateConversationStatus(convoList, newStatus);
    }
    if(deleteAll == "true") {
        deleteConversations(convoList);
    }
});

