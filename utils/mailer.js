const nodeMailer = require("nodemailer");

const sendEmail = async (email, subject, html) => {
  try {
    const transporter = nodeMailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS_KEY,
      },
      authMethod: "PLAIN",
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
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
