const cron = require("node-cron");
const { off } = require("../models/Report");
const Check = require("../models/Check");
const checkURL = require("./job");

let scheduled_jobs = {};
function scheduleTask(check) {
    scheduled_jobs[check._id.toString()] = cron.schedule('*/' + check.interval + ' * * * *',  async function(){
        checkURL(check);
    });
}
// Schedule all the check
async function startAllTasks() {
    const checks = await Check.find({});
    for (check of checks) {
        scheduleTask(check);
    }
}

function stopTask(check_id) {
    const id = check_id.toString();
    scheduled_jobs[id].stop();
    delete scheduleTask[id];
}

module.exports = {
    scheduleTask, startAllTasks, stopTask
}