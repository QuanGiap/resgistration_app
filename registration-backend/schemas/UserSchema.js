const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    hasVerified:{
        type:Boolean,
        default:false
    },
    firstName:{
        type:String,
        require:true
    },
    lastName:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    country:{
        type:String,
        require:true
    },
    phoneNumber:{
        type:String,
    },
    codeVerication:{
        type:Object,
        default:{
            code:"",
            date:Date.now()
        }
    }
},{timestamps: true})
const user = mongoose.model('userInform',userSchema);
module.exports = user;