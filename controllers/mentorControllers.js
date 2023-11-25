const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
const config = require("../model/config");
const pool = mysql.createPool(config);
const {
  insertData,
  selectData,
  deleteData,
  updateData,
} = require("../utils/sqlHandlers");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dm7rsnfaj",
  api_key: 158634195245211,
  api_secret: "X5XpIpJG-jBLi84rQWsNuzu0Hg8",
});

const {
  generateToken,
  createMessage,
  verifyToken,
  genAccessToken,
} = require("../utils/utilities");
const sendEmail = require("../utils/mailer");

const getAllMentors = async (req, res) => {
  const data = await selectData("mentors", "updated", true);
  return res.status(200).json({ mentors: [...data] });
};

const getMentorProfile = async (req, res) => {
  const { userId } = req.params;
  const data = await selectData("mentors", "id", userId);
  return res.status(200).json({ profile: [...data] });
};

const searchMentor = async (req, res) => {
  const { industry } = req.params;
  try {
    const data = await selectData('mentors', "industry", industry);
    return res.status(200).json({ mentors: [...data] });
  } catch (error) {
    console.log(error);
  }
};

const Register = async (req, res) => {
  const { firstName, initials, email, password, telNumber } = req.body;
  const saltRounds = 16;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = {
    firstName,
    initials,
    email,
    telNumber,
    password: hashedPassword,
    verified: false,
  };

  const existingUsers = await selectData("mentors", "email", email);
  if (existingUsers.length > 0) {
    return res
      .status(409)
      .json({ success: false, message: "User already exists" });
  }

  const { insertId } = await insertData("mentors", user);
  const token = generateToken(insertId);
  const redirectURL = `${process.env.FRONTEND_URL}/mentor/${insertId}/application`;
  const verificationMessage = `To get started and enjoy all the benefits of our platform, we need to verify your email address. <br/>Please click the button below to verify your email address<br/>
  Once you've verified your email, you'll have full access to your account and can start using our services immediately.`;
  const verificationLink = `${process.env.BASE_URL}/mentor/verifyEmail${token.urlQuery}&redirect=${redirectURL}`;
  const subject = "Verify your email";
  const emailMessage = createMessage(
    verificationMessage,
    verificationLink,
    subject,
    "Verify your email"
  );

  await sendEmail(email, subject, emailMessage);
  await insertData("tokentable", { token: token.token });

  return res.status(200).json({
    message: "An email verification link has been sent to your email address",
  });
};

const verifyEmail = async (req, res) => {
  const { userId, token, expirationTime, redirect } = req.query;
  const invalidTokenURL = `${process.env.FRONTEND_URL}/auth/mentor/${userId}/invalidToken`;
  try {
    const isTokenValid = await verifyToken(token, expirationTime);
    if (isTokenValid) {
      res.redirect(redirect);
    } else {
      await deleteData("tokentable", "token", token);
      res.redirect(invalidTokenURL);
    }
  } catch (error) {
    console.log(error);
  }
};

const updateApplication = async (req, res) => {
  const { userId } = req.params;
  const {
    job_title,
    industry,
    yrs_of_experience,
    social_link,
    bio,
    why_mentoring,
    telNumber,
  } = req.body;
  const updates = {
    job_title,
    industry,
    yrs_of_experience,
    social_link,
    bio,
    why_mentoring,
    telNumber,
    updated: true,
  };
  try {
    const updated = await updateData("mentors", updates, "id", userId);
    if (updated === false) {
      return res.json({
        success: false,
        message: "There was an error in your application",
      });
    } else {
      return res.json({
        success: true,
        message: "Application submitted successfully",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const checkUser = await selectData("mentors", "email", email);
    if (checkUser.length === 1) {
      const user = checkUser[0];
      const verifyPassword = await bcrypt.compare(password, user.password);
      if (verifyPassword) {
        delete user.password;
        const accessToken = genAccessToken(user.id);
        return res.status(200).json({
          message: "Logged in successfully",
          token: accessToken,
          ...user,
        });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Incorrect password" });
      }
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Invalid login details" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const Upload = async (req, res) => {
  const { userId } = req.params;
  const folderName = "mentors";
  cloudinary.uploader
    .upload_stream({ folder: folderName }, async (error, result) => {
      if (error) {
        return res.status(400).json({ error: "Error uploading to Cloudinary" });
      }

      const imageUrl = result.url;
      try {
        await updateData("mentors", { image: imageUrl }, "id", userId);
        return res.json({
          image: imageUrl,
          message: "image uploaded successfully",
        });
      } catch (error) {
        console.log(error);
      }
    })
    .end(req.file.buffer);
};

const updateDetails = async (req, res) => {
  const {
    firstName,
    initials,
    currentRole,
    experience,
    skills,
    bio,
    How_help,
    country,
  } = req.body;
  const { userId } = req.params;
  const updates = {
    firstName,
    initials,
    currentRole,
    experience,
    skills,
    bio,
    How_help,
    country,
    updated: true,
  };
  await updateData("mentors", updates, "id", userId);
  res
    .status(200)
    .json({ message: "Profile updated successfully", update: updates });
};

const updateMentorProfile = async (req, res) => {
  const { userId } = req.params;
  const {
    job_title,
    industry,
    yrs_of_experience,
    social_link,
    bio,
    why_mentoring,
    telNumber,
  } = req.body;
  const updates = {
    job_title,
    industry,
    yrs_of_experience,
    social_link,
    bio,
    why_mentoring,
    telNumber,
    updated: true,
  };
  try {
    await updateData("mentors", updates, "id", userId);
    res.json({
      message: "Application submitted successfully",
      update: updates,
    });
  } catch (error) {
    console.log(error);
  }
};

const sendPwdResetLink = async (req, res) => {
  const { email } = req.body;
  try {
    const getUser = await selectData("mentors", "email", email);
    if (getUser.length == 1) {
      const user = getUser[0];
      const credentials = generateToken(user.id);
      const redirectURL = `${process.env.FRONTEND_URL}/auth/mentor/${user.id}/password_reset`;
      const verificationLink = `${process.env.BASE_URL}/mentor/verifyPasswordResetLink${credentials.urlQuery}&redirect=${redirectURL}`;
      const subject = "Password Reset";
      const pwdMessage = `Dear ${user.fullName}, <br/><br/>
      We received a request to reset the password for your account. If you did not make this request, you can safely ignore this message. Your current password will remain unchanged.<br/>To reset your password, please click on the button below: <br/>This link will expire in 2 mins, so please use it as soon as possible. If the link has expired, you can request another password reset.<br />
      `;

      const mesageBody = createMessage(
        pwdMessage,
        verificationLink,
        subject,
        "Password reset"
      );
      await insertData("tokentable", { token: credentials.token });
      await sendEmail(email, subject, mesageBody);

      return res.status(200).json({
        message: "The password reset link has been sent to your email",
      });
    } else {
      return res.status(404).json({ message: "Email not recognised" });
    }
  } catch (error) {
    console.log(error);
  }
};

const sendResetToken = async (req, res) => {
  const { email } = req.body;
  try {
    const getUser = await selectData("mentors", "email", email);
    if (getUser.length == 1) {
      const user = getUser[0];
      const credentials = generateToken(user.id);
      const redirectURL = `${process.env.FRONTEND_URL}/mentor/${user.id}/application`;
      const verificationLink = `${process.env.BASE_URL}/mentor/verifyEmail${credentials.urlQuery}&redirect=${redirectURL}`;
      const verificationMessage = `To get started and enjoy all the benefits of our platform, we need to verify your email address. <br/>Please click the button below to verify your email address<br/>
  Once you've verified your email, you'll have full access to your account and can start using our services immediately.`;

      const subject = "Verify your email";
      const emailMessage = createMessage(
        verificationMessage,
        verificationLink,
        subject,
        "Verify your email"
      );
      await insertData("tokentable", { token: credentials.token });
      await sendEmail(email, subject, emailMessage);

      return res.status(200).json({
        message:
          "An email verification link has been sent to your email address",
      });
    } else {
      return res.status(404).json({ message: "Email not recognised" });
    }
  } catch (error) {
    console.log(error);
  }
};

const verifyPwdLink = async (req, res) => {
  const { userId, token, expirationTime, redirect } = req.query;
  const errorUrl = `${process.env.FRONTEND_URL}/auth/mentor/${userId}/invalidpwdToken`;
  try {
    const isTokenValid = await verifyToken(token, expirationTime);
    if (isTokenValid) {
      res.redirect(redirect);
    } else {
      res.redirect(errorUrl);
    }
  } catch (error) {
    console.log(error);
  }
};

const updatePassword = async (req, res) => {
  const { password, confirm_password } = req.body;
  const { userId } = req.params;
  try {
    if (password === confirm_password) {
      const salt = await bcrypt.genSalt(16);
      const hashed = await bcrypt.hash(password, salt);
      const update = { password: hashed };
      await updateData("mentors", update, "id", userId);
      return res.status(200).json({ message: "Password updated successfully" });
    } else {
      return res.status(400).json({ message: "Passwords do not match" });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllMentors,
  getMentorProfile,
  searchMentor,
  Register,
  verifyEmail,
  updateApplication,
  Login,
  Upload,
  updateDetails,
  updateMentorProfile,
  sendPwdResetLink,
  sendResetToken,
  verifyPwdLink,
  updatePassword,
};
