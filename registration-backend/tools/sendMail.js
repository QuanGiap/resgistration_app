let client = require('@sendgrid/mail')
require('dotenv').config();
client.setApiKey(process.env.SEND_GRID_API_KEY);

const sendEmail = (email,code) => client.send({
    to:{
        email:email,
        name:"Jayson"
    },
    from:{
        email:process.env.MY_SECRET_EMAIL,
        name:"Verification server"
    },
    subject:"Verify code",
    templateId:'d-2526dbf853194eb2a2745df17bc8255c',
    dynamicTemplateData:{
        code:code
    }
}).then(()=>console.log("Email sended")).catch(err=>console.log(err.message));

module.exports = sendEmail;