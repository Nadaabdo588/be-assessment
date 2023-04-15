const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
async function sendMail(verficationCode, receiver) {
    const text = `Thank you for your registeration. Please verify your email using the following verfication code: ` + verficationCode;

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.AUTH_USER,
            pass: process.env.AUTH_PASS,
        }
    });

    let info = await transporter.sendMail({
        from: `${process.env.AUTH_USER}`, // sender address
        to: `${receiver.email}`, // list of receivers
        subject: "Email verification", // Subject line
        text: text, // plain text body

    });

}
module.exports = sendMail;