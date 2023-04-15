const mongoose = require('mongoose');

const UserSchema= new mongoose.Schema({
    username:{type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },

    first_name:{type:String,
    required:true
    },
    
    last_name:{type:String,
        required:true
    },
    
    email:{type:String,
        required:true
    },  
    verfication_code:{
        type: String,
        required: true,
    },
    verified:{
        type: Boolean,
        default: false,
    }
});


const User = mongoose.model('User',UserSchema, 'User');
module.exports = User;