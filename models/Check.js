const mongoose = require('mongoose');

const CheckSchema= new mongoose.Schema({
    user_id: {
        type: mongoose.ObjectId,
        required:true,
        unique: false,
    },
    name:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    protocol:{
        type:String,
    required:true
    },
    port:{
        type:String,
    },
    webhook:{
        type:String,
    },
    timeout: {
        type:Number,
        default: 5,
    }, 
    interval: {
        type:Number,
        default: 10,
    },  
    threshold: {
        type:Number,
        default:1,
    },
    authentication: {
        type: mongoose.Schema(
            {
                username:{
                    type: String
                },
                password:{
                    type: String
                }
            }
        )
    },
    http_headers:{
        type: Map,
        of: String
    },
    assert: {
        type: String
    },
    tags:{
        type: Array,
        of: String
    },
    ignore_SSL:{
        type: Boolean
    },
    last_status:{
        type: Boolean
    }  
});


const Check = mongoose.model('Check',CheckSchema, 'Check');
module.exports = Check;