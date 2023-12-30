const nodeMailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID =
  "1080476634590-rn19ae14n7mk4god3gqagef2qtvok48a.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN =
  "1//04fS7ATYTeJfFCgYIARAAGAQSNwF-L9Ir0HjgJDo1jNo36iR9SfxMfRLZmmDeU2b_7xxvONauWO3gG9aHDibpzq_xymiSMCjVe3w";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const sendEmail = async (email, subject, html) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "chromax.design@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: "chromax.design@gmail.com",
      to: email,
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
