const dotenv = require('dotenv');
const sendMail = require("../services/nodemailer_service");
const Check = require('../models/Check');

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

        // Job scheduling to be added
        // Report to be created

        //Create the new check
        const newCheck = await Check.create(check);
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
    if(req.body.name)
    {
        const existingName = await Check.findOne({name: req.body.name, user_id});
        if(existingName)
        {
            return res.status(400).json({ msg: "Check with same name exists" });
        }   
    }
    const newCheck= await Check.findByIdAndUpdate(check_id,check,{new: true});
    //update job schedule
    // Update reports
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
    // delete report
    oldCheck.deleteOne();
    return res.status(200).json({ msg: "Check deleted", check: oldCheck });

}

function checkExistingCheck(user_id, name) {
    return Check.findOne({ user_id, name });
}

module.exports = { createCheck, getCheckByID, updateCheck, deleteCheck }