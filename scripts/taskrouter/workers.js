require("dotenv").config();
const fs = require("fs");
const Twilio = require("twilio");
const args = require('yargs')(process.argv.slice(2))
    .string('newSkills')
    .usage('Usage: $0 --newSkills=dunnoyet')
    .describe('newSkills', '(Optional) New routing skills to add to workers that do not have any routing skills')
    .default('newSkills', "")
    .argv;

const accountSid = process.env.TWILIO_ACCT_SID;
const authToken = process.env.TWILIO_ACCT_AUTH;
const workspaceSid = process.env.TWILIO_WORKSPACE_SID;
const client = Twilio(accountSid, authToken);

async function addSkills(newSkills) {
    // Get all workers
    let workers = await client
        .taskrouter.v1.workspaces(workspaceSid)
        .workers
        .list();

   let promiseAry = [];
    workers.forEach(w => {
        const attributes = JSON.parse(w.attributes);
        const newAttributes = { ...attributes };
        newAttributes.routing = newSkills;
        promiseAry.push(client.taskrouter.v1.workspaces(workspaceSid).workers(w.sid).update({"attributes":JSON.stringify(newAttributes)}));
    });
    return promiseAry;
}

/**
 * Lists all workers routing skills
 */
async function outputWorkerSkills() {
    // Get all workers
    let workers = await client
        .taskrouter.v1.workspaces(workspaceSid)
        .workers
        .list();
    workers.forEach(w => console.log(w.sid, JSON.parse(w.attributes).routing));
    return workers;
}

const newSkills = JSON.parse(args.newSkills ? args.newSkills : "{}");

if(args.newSkills) {
    addSkills(newSkills).then( (promiseAry) =>
        Promise.all(promiseAry).then( (foo) => {
            console.log("finished updating");
            outputWorkerSkills();
        }));
} else {
    outputWorkerSkills();
}
