const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    check_id: {
        type: mongoose.ObjectId,
        required: true,
        unique: true
    },
    status: {
        type: Number,
        required: true
    },
    availability: {
        type: Number,
        required: true
    },
    outages: {
        type: Number,
        required: true
    },
    downtime: {
        type: Number,
        required: true
    },
    uptime: {
        type: Number,
        required: true
    },
    response_time:
    {
        type: Number,
        required: true,
    },
    total_response_time:
    {
        type: Number,
        default:0
    },
    total_requests:
    {
        type: Number,
        default:0,
    },
    succ_failures:{
        type: Number,
        default:0,
    },
    history: [
        {
            info: String,
            date: Date
        }
    ]
});


const Report = mongoose.model('Report', ReportSchema, 'Report');
module.exports = Report;