const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    check_id: {
        type: mongoose.ObjectId,
        required: true,
        unique: true
    },
    status: {
        type: String,
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
    history: [
        {
            check_name: String,
            date: Date
        }
    ]
});


const Report = mongoose.model('Report', ReportSchema, 'Report');
module.exports = Report;