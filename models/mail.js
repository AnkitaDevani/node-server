const nodemailer = require("nodemailer");
/*const SMTPServer = require("smtp-server").SMTPServer;
const SMTPConnection = require("nodemailer/lib/smtp-connection");
let connection = new SMTPConnection();*/

let testAccount =  nodemailer.createTestAccount();
let transporter = nodemailer.createTransport({
         host: "main.travesymedia.com",
        port: 587,
        secure: false,
        service: 'gmail',
        auth: {
            user: 'test@travesymedia.com', // generated ethereal user
            pass: '123abc', // generated ethereal password
        },
    });

module.exports = transporter;