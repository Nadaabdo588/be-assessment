const Check = require("../models/Check");
const Report = require("../models/Report");

async function getReports(req, res) {
    const user_id = req.params.user_id;
    const checks = await Check.find({user_id});

    //Get all reports for a given user id
    const userReports = await getUserReports(checks);    
    return res.status(200).json({ reports: userReports });
}
async function getReportsByTag(req, res) {
    const tag= req.params.tag;
    const user_id = req.params.user_id;
    const checks = await Check.find({user_id: user_id, tags: tag});

    //Get all reports for a given user id
    const userReports = await getUserReports(checks);
    return res.status(200).json({ reports: userReports });
}
async function getUserReports(userChecks){
    let userReports=[];
    for(check of userChecks){
        const report= await Report.findOne({check_id:check._id});
        if(report)
        {
            userReports.push({report});
        }
    }
    return userReports;
}
module.exports={getReports, getReportsByTag}