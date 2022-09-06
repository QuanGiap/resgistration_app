const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
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
    }
},{timestamps: true})
const user = mongoose.model('userInform',userSchema);
module.exports = user;