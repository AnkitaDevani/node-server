const nodemailer = require("nodemailer");
/*const SMTPServer = require("smtp-server").SMTPServer;
const SMTPConnection = require("nodemailer/lib/smtp-connection");
let connection = new SMTPConnection();*/

let testAccount =  nodemailer.createTestAccount();
let transporter = nodemailer.createTransport({
        // host: "smtp12.gmail.com",
        // port: 465,
        // secure: true,
        service: 'gmail11',
        auth: {
            user: 'abc@gmail.com', // generated ethereal user
            pass: '1234', // generated ethereal password
        },
    });

module.exports = transporter;