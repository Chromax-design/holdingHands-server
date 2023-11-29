const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const { insertData, selectData, updateData } = require("../utils/sqlHandlers");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dm7rsnfaj",
  api_key: 158634195245211,
  api_secret: "X5XpIpJG-jBLi84rQWsNuzu0Hg8",
});

const {
  createMessage,
  verifyOTP,
  generateOTP,
  genAccessToken,
} = require("../utils/utilities");
const sendEmail = require("../utils/mailer");

const getAllMentees = async (req, res) => {
  const data = await selectData("mentees", "updated", true);
  return res.status(200).json({ mentors: [...data] });
};

const getMenteeDetails = async (req, res) => {
  const { user } = req;
  return res.status(200).json({ ...user });
};

const Register = async (req, res) => {
  const { firstName, initials, email, password, telNumber } = req.body;
  try {
    const saltRounds = 16;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = {
      userId: uuidv4(),
      firstName,
      initials,
      email,
      telNumber,
      password: hashedPassword,
    };

    const existingUsers = await selectData("mentees", "email", email);
    if (existingUsers.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    await insertData("mentees", user);
    const { otp, time } = generateOTP();
    const otpMessage = `Dear ${user.firstName},<br/><br/>
  We hope this message finds you well. As part of our commitment to ensuring the security of your account with weHoldaHand, we are implementing an additional layer of protection through OTP (One-Time Password) verification. Below is your code and it expires in 5mins`;
    const subject = "OTP Verification for your weHoldaHand mentee Account";
    const emailMessage = createMessage(otpMessage, subject, otp);

    await sendEmail(email, subject, emailMessage);
    await insertData("otptable", {
      otp: otp,
      userId: user.userId,
      timestamp: time,
    });

    return res.status(200).json({
      success: true,
      message: "Your OTP has been sent to your email address",
    });
  } catch (error) {
    console.log(error);
  }
};

const verifyEmailOTP = async (req, res) => {
  const { otp } = req.body;
  const data = await selectData("otptable", "otp", otp);
  if (data.length > 0) {
    const storedTimestamp = data[0].timestamp;
    if (verifyOTP(storedTimestamp)) {
      return res.status(200).json({
        success: true,
        userId: data[0].userId,
        message: "Registration successful",
      });
    } else {
      return res.status(401).json({ expired: true, message: "OTP expired" });
    }
  } else {
    return res.status(404).json({ success: false, message: "OTP not found" });
  }
};

const resendEmailOTP = async (req, res) => {
  const { email } = req.body;
  const data = await selectData("mentees", "email", email);
  if (data.length > 0) {
    const { otp, time } = generateOTP();
    const otpMessage = `Dear ${data[0].firstName},<br/><br/>
    We hope this message finds you well. As part of our commitment to ensuring the security of your account with weHoldaHand, we are implementing an additional layer of protection through OTP (One-Time Password) verification. Below is your code and it expires in 5mins`;
    const subject = "OTP Verification for your weHoldaHand mentee Account";
    const emailMessage = createMessage(otpMessage, subject, otp);

    await sendEmail(email, subject, emailMessage);
    await insertData("otptable", {
      otp: otp,
      userId: data.userId,
      timestamp: time,
    });

    return res.status(200).json({
      success: true,
      message: "Your OTP has been sent to your email address",
    });
  } else {
    return res.status(404).json({ message: "Email does not exist" });
  }
};

const updateApplication = async (req, res) => {
  const { userId } = req.params;
  const {
    other,
    challenge,
    learning_style,
    personality_trait,
    goal,
    telNumber,
    mentor_type,
  } = req.body;
  const updates = {
    other,
    challenge,
    learning_style,
    personality_trait,
    goal,
    telNumber,
    mentor_type,
    updated: true,
  };
  const updated = await updateData("mentees", updates, "userId", userId);
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
};

const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const checkUser = await selectData("mentees", "email", email);
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
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const loginWithGoogle = async (req, res) => {
  const { firstName, email } = req.body;
  try {
    const data = await selectData("mentees", "email", email);
    if (data.length > 0) {
      return res
        .status(200)
        .json({ message: "you logged in successfully", ...data[0] });
    } else {
      const userData = {
        firstName,
        email,
        userId: uuidv4(),
        password: "",
      };
      await insertData("mentees", userData);
      return res.json({ message: "Registration was successful", ...userData });
    }
  } catch (error) {
    console.log(error);
  }
};

const sendPwdResetOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const data = await selectData("mentees", "email", email);
    if (data.length > 0) {
      const { otp, time } = generateOTP();
      const otpMessage = `Dear ${data[0].firstName},<br/><br/>
    We recently received a request to reset the password for your mentee account. To proceed with the password reset, please use the following One-Time Password (OTP):`;
      const subject = "Password Reset OTP for Your WeHoldaHand Mentee Account";
      const emailMessage = createMessage(otpMessage, subject, otp);

      await sendEmail(email, subject, emailMessage);
      await insertData("otptable", {
        otp: otp,
        userId: data[0].userId,
        timestamp: time,
      });

      return res.status(200).json({
        success: true,
        message: "Your OTP has been sent to your email address",
      });
    } else {
      return res.status(404).json({ message: "Email does not exist" });
    }
  } catch (error) {
    console.log(error);
  }
};

const verifyPwdOTP = async (req, res) => {
  const { otp } = req.body;
  const data = await selectData("otptable", "otp", otp);
  if (data.length > 0) {
    const storedTimestamp = data[0].timestamp;
    if (verifyOTP(storedTimestamp)) {
      return res.status(200).json({
        success: true,
        userId: data[0].userId,
        message: "OTP is valid",
      });
    } else {
      return res.json({ expired: true, message: "OTP expired" });
    }
  } else {
    return res.status(404).json({ success: false, message: "OTP not found" });
  }
};

const resetPwd = async (req, res) => {
  const { password, confirm_password } = req.body;
  const { userId } = req.params;
  try {
    if (password === confirm_password) {
      const salt = await bcrypt.genSalt(16);
      const hashed = await bcrypt.hash(password, salt);
      const update = { password: hashed };
      await updateData("mentees", update, "userId", userId);
      return res.status(200).json({ message: "Password updated successfully" });
    } else {
      return res.status(400).json({ message: "Passwords do not match" });
    }
  } catch (error) {
    console.log(error);
  }
};

const Upload = async (req, res) => {
  const { userId } = req.params;
  const folderName = "mentees";
  cloudinary.uploader
    .upload_stream({ folder: folderName }, async (error, result) => {
      if (error) {
        return res.status(400).json({ error: "Error uploading to Cloudinary" });
      }

      const imageUrl = result.url;
      try {
        await updateData("mentees", { image: imageUrl }, "id", userId);
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
  const { firstName, initials, dob, country, city, bio } = req.body;
  const { userId } = req.params;
  const updates = {
    firstName,
    initials,
    dob,
    country,
    city,
    bio,
    updated: true,
  };
  await updateData("mentees", updates, "id", userId);
  res
    .status(200)
    .json({ message: "Profile updated successfully", update: updates });
};

const updateMenteeProfile = async (req, res) => {
  const { userId } = req.params;
  const {
    other,
    challenge,
    learning_style,
    personality_trait,
    goal,
    telNumber,
    mentor_type,
  } = req.body;
  const updates = {
    other,
    challenge,
    learning_style,
    personality_trait,
    goal,
    telNumber,
    mentor_type,
    updated: true,
  };
  try {
    await updateData("mentees", updates, "id", userId);

    res.json({
      message: "Application submitted successfully",
      update: updates,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllMentees,
  getMenteeDetails,
  Register,
  verifyEmailOTP,
  resendEmailOTP,
  updateApplication,
  Login,
  loginWithGoogle,
  Upload,
  updateDetails,
  updateMenteeProfile,
  sendPwdResetOTP,
  verifyPwdOTP,
  resetPwd,
};
