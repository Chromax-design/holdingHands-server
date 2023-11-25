const nodeMailer = require("nodemailer");

const sendEmail = async (email, subject, html) => {
  try {
    const transporter = nodeMailer.createTransport({
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS_KEY,
      },
      tls: {
        rejectUnauthorized: false
      },
      authMethod: "PLAIN",
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      html: html,
    });
    console.log("email sent successfully");
  } catch (error) {
    console.error(error);
    console.error("email not sent");
    throw error
  }
};

module.exports = sendEmail;
