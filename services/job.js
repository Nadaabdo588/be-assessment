const axios = require('axios');
const Report = require('../models/Report');
const User = require('../models/User');
const sendMail = require('./nodemailer_service');
axios.interceptors.request.use(function (config) {
    //Log request time
    config.headers['start_time'] = new Date();
    return config;
}, function (error) {
    return Promise.reject(error);
});
axios.interceptors.response.use(function (response) {

    response.config.headers['end_time'] = new Date();
    response.duration = response.config.headers['end_time'] - new Date(response.config.headers['start_time']);
    return response;

}, function (error) {
    return Promise.reject(error);
});

async function checkURL(check) {
    const timeout = check.timeout;
    const headers = check.headers;
    const autherization = check.authentication;
    const protocol = check.protocol;
    const port = check.port;
    const path = check.path;
    const ignore_SSL = check.ignore_SSL;
    const url = protocol + "://" + check.url + (port ? ":" + port : "") + (path ? "/" + path : "");

    //Set request config options
    const config = {}
    config['timeout'] = timeout * 1000;
    if (autherization)
        config['auth'] = autherization
    if (ignore_SSL != null)
        config['httpsAgent'] = new https.Agent({
            rejectUnauthorized: !ignore_SSL
        });
    if (headers)
        config['headers'] = headers;

    try {
        const response = axios.get(url, config)
            .then(
                async function (response) {
                    await updateCheckReport(response, check);
                }
            )
            .catch(function (error) {
                // handle failure
                console.log(error);
            })
    } catch (err) {
        console.log(err);
    }

}

async function updateCheckReport(response, check) {
    const report = await Report.findOne({ check_id: check._id.toString() });
    if (report) {
        const newStatus = response.status;
        const newOtages = response.error ? report.outages + 1 : report.outages;
        const newTotalResponseTime = response.error ? report.total_response_time : report.total_response_time + response.duration / 1000;
        const newTotalRequests = response.error ? report.total_requests : report.total_requests + 1;
        const newResponseTime = newTotalRequests == 0 ? 0 : newTotalResponseTime / newTotalRequests;
        const newDownTime = response.error ? report.downtime + check.interval * 60 : report.downtime;
        const newUpTime = response.error ? report.uptime : report.uptime + check.interval * 60;
        const newAvailability = newUpTime / (newDownTime + newUpTime) * 100;
        const newHistory = report.history;
        const newSuccFailures = response.error ? report.succ_failures + 1 : 0;
        //Notify user 
        const user = await User.findById(check.user_id.toString());
        if (user) {
            //Notify user if the number of failures exceeds the check threshold
            if (newSuccFailures > check.threshold) {
                const mailText = 'Alert! Requests to this URL: ' + check.url + ' have faild '
                    + newSuccFailures + ' times in a row';
                sendMail(mailText, user);
                newSuccFailures = 0;
            }
            //Notify user when the server status change
            if (response.error && report.status == 200) {
                const mailText = 'The server for the URL: ' + check.url + 'is  now down!'
                sendMail(mailText, user);
            }
            if (!response.error && report.status != 200) {
                const mailText = 'The server for the URL: ' + check.url + 'is  now up!'
                sendMail(mailText, user);
            }
        }

        newHistory.push({ "info": (response.error), "date": new Date(response.config.headers['start_time']) });
        const updatedReport = await Report.findOneAndUpdate({ check_id: check._id.toString() },
            {
                status: newStatus,
                outages: newOtages,
                availability: newAvailability,
                downtime: newDownTime,
                uptime: newUpTime,
                response_time: newResponseTime,
                total_requests: newTotalRequests,
                total_response_time: newTotalResponseTime,
                succ_failures: newSuccFailures,
                history: newHistory
            });
        console.log(updatedReport);
    } else {
        console.log("Report not found");
    };
}

module.exports = checkURL;