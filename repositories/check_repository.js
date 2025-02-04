const sendMail = require("../services/nodemailer_service");
const Check = require('../models/Check');
const Report = require("../models/Report");
const { scheduleTask, stopTask } = require("../services/scheduler");

async function getCheckByID(req, res) {
    const check_id = req.params.check_id;
    const user_id = req.params.user_id;
    const check = await Check.findById(check_id);
    //Check if a user gets its own check
    if (!check)
        return res.status(400).json({ msg: "Check not found" });
    if (check.user_id != user_id)
        return res.status(400).json({ msg: "Unautherized action" });

    return res.status(200).json({ check: check });

}

async function createCheck(req, res) {
    const check = req.body;
    if (!(check.user_id && check.name && check.url && check.protocol)) {
        return res.status(400).json({
            msgSrc: "missing input",
            msg: "User id, check name, url, and protocol are required"
        });
    } else {
        const existingCheck = await checkExistingCheck(check.user_id, check.name);
        if (existingCheck)
            return res.status(400).json({ msg: "Check already existing" });

        //Create the new check
        const newCheck = await Check.create(check);
        // Job to be scheduled
        scheduleTask(newCheck);
        // Report to be created
        Report.create({
            check_id: newCheck._id,
            status: "up",
            availability: 0,
            outages: 0,
            downtime: 0,
            uptime: 0,
            response_time: 0,
            history: [],
        })
        return res.status(200).json({ msg: "Check created", check: newCheck });

    }
}
async function updateCheck(req, res) {
    const check_id = req.params.check_id;
    const user_id = req.params.user_id;
    const check = req.body;
    const oldCheck = await Check.findById(check_id);
    //Check if a user updates its own check
    if (!oldCheck) {
        return res.status(400).json({ msg: "Check not found" });
    }
    if (oldCheck.user_id != user_id) {
        return res.status(400).json({ msg: "Unautherized action" });
    }
    if (req.body.name) {
        const existingName = await Check.findOne({ name: req.body.name, user_id });
        if (existingName) {
            return res.status(400).json({ msg: "Check with same name exists" });
        }
    }

    const newCheck = await Check.findByIdAndUpdate(check_id, check, { new: true });
    //update job schedule
    stopTask(check_id);
    scheduleTask(check);

    return res.status(200).json({ msg: "Check updated", check: newCheck });

}

async function deleteCheck(req, res) {
    const check_id = req.params.check_id;
    const user_id = req.params.user_id;

    const oldCheck = await Check.findById(check_id);
    //Check if a user updates its own check
    if (!oldCheck) {
        return res.status(400).json({ msg: "Check not found" });
    }
    if (oldCheck.user_id != user_id) {
        return res.status(400).json({ msg: "Unautherized action" });
    }
    //delete job 
    stopTask(check_id);
    // delete report
    oldCheck.deleteOne();
    Report.deleteOne({ check_id: check_id });
    return res.status(200).json({ msg: "Check deleted", check: oldCheck });

}

function checkExistingCheck(user_id, name) {
    return Check.findOne({ user_id, name });
}

module.exports = { createCheck, getCheckByID, updateCheck, deleteCheck }