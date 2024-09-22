const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
const { google } = require("googleapis");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_ID_SECRET = process.env.CLIENT_ID_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_ID_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function newTransport() {
  try {
    if (process.env.NODE_ENV === "production") {
      // Sendgrid
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: "toshbozor.uz@gmail.com",
          clientId: CLIENT_ID,
          clientSecret: CLIENT_ID_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: oAuth2Client.getAccessToken(),
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } catch (error) {
    throw new Error(`Could not create transporter: ${error}`);
  }
}

async function sendEmail(user, url, template, subject, otp, email) {
  try {
    const from = `Toshbozor <${process.env.EMAIL_FROM}>`;
    const to = email || user.email;
    const username = user.username;

    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      username,
      url,
      subject,
      otp,
    });

    // 2) Define email options
    const mailOptions = {
      from,
      to,
      subject,
      html,
      // text: htmlToText.fromString(html),
    };
    // 3) Create a transport and send email
    const transport = await newTransport();
    await transport.sendMail(mailOptions);
  } catch (error) {
    throw new Error(`Could not send email: ${error}`);
  }
}

async function sendWelcomeEmail(user) {
  try {
    await sendEmail(user, url, "welcome", "Welcome to the Toshbozor Family!");
  } catch (error) {
    // Handle error
    console.error(`Error sending welcome email: ${error}`);
  }
}

async function sendPasswordResetEmail(user, url) {
  try {
    await sendEmail(
      user,
      url,
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  } catch (error) {
    // Handle error
    console.error(`Error sending password reset email: ${error}`);
  }
}

async function sendOTPEmail(user, email, otp) {
  try {
    await sendEmail(
      user,
      null,
      "verificationOTP",
      "Your verification OTP (valid for only 10 minutes)",
      otp,
      email
    );
  } catch (error) {
    // Handle error
    console.error(
      `Error sending password reset email: ${(error, error.stack)}`
    );
  }
}
module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
};
