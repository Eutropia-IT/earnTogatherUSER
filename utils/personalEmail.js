const nodemailer = require('nodemailer');
const {google} = require('googleapis');


const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN});


const sendEmail = async options =>{
    const accessToken = await oAuth2Client.getAccessToken();
    // 1 create a transpoter
    const transpoter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'earntogether46@gmail.com',
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: accessToken
        }
    });
    // 2 Define the email options
    const mailOptions = {
        from: 'Earn Together <earntogether46@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };
    // 3 send mail
    await transpoter.sendMail(mailOptions);
};

module.exports = sendEmail;