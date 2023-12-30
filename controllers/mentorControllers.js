const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const {
  genAccessToken,
  createMessage,
  generateOTP,
  verifyOTP,
} = require("../utils/utilities");
const {
  getMenteeSubscribed,
  getPaymentDetails,
  getReviewCount,
} = require("../utils/mentorSqlHandlers");
const sendEmail = require("../utils/mailer");
const {
  insertData,
  selectData,
  searchData,
  updateData,
  deleteData,
} = require("../utils/sqlHandlers");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dm7rsnfaj",
  api_key: 158634195245211,
  api_secret: "X5XpIpJG-jBLi84rQWsNuzu0Hg8",
});

const getAllMentors = async (req, res) => {
  const data = await selectData("mentors", "verified", true, undefined, 12);
  return res.status(200).json({ mentors: [...data] });
};

const getMentorProfile = async (req, res) => {
  const { userId } = req.params;
  const data = await selectData("mentors", "userId", userId);
  return res.status(200).json({ profile: [...data] });
};

const searchMentor = async (req, res) => {
  const { industry } = req.params;
  try {
    const data = await searchData("mentors", "industry", industry);
    return res.status(200).json({ mentors: [...data] });
  } catch (error) {
    console.log(error);
  }
};

const handleSearch = async (req, res) => {
  const { search } = req.body;
  try {
    const data = await searchData("mentors", "industry", search);
    if (data.length == 0) {
      return res
        .status(404)
        .json({ message: "No mentor found for this category" });
    } else {
      return res.json({ mentors: data });
    }
  } catch (error) {
    console.log(error);
  }
  res.json({ message: "sent" });
};

const Register = async (req, res) => {
  const { firstName, initials, email, password, confirmPassword, telNumber } =
    req.body;
  const saltRounds = 12;
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

  if (password !== confirmPassword) {
    return res.status(401).json({ message: "Passwords do not match" });
  }

  const existingUsers = await selectData("mentors", "email", email);
  if (existingUsers.length > 0) {
    return res
      .status(409)
      .json({ success: false, message: "User already exists" });
  }

  const message =
    "Thank you for registering with our service. To complete the registration process. Please enter this OTP on our website to verify your email address. Note that this OTP is valid for a limited time. If you did not sign up for our service, please ignore this email.";
  const subject = "Email verification";
  const { otp } = generateOTP();
  const format = createMessage(message, subject, otp);
  const tokenData = {
    otp,
  };

  await insertData("otp", tokenData);
  await sendEmail(email, subject, format);
  await insertData("mentors", user);
  return res.status(200).json({
    success: true,
    message: "Please verify your email",
    userId: user.userId,
  });
};

const ConfirmRegistration = async (req, res) => {
  const { otp } = req.body;
  const { userId } = req.params;
  const isValid = await verifyOTP(otp);
  if (isValid) {
    const update = {
      accountVerified: true,
    };
    await updateData("mentors", update, "userId", userId);
    await deleteData("otp", "otp", otp);
    return res.status(200).json({
      success: true,
      message: "Account verification was successful",
      userId,
    });
  } else {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const ResendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const getDetails = await selectData("mentors", "email", email);
    if (getDetails.length == 0) {
      return res.status(404).json({ message: "Email not found" });
    }
    const userId = getDetails[0].userId;

    const message =
      "You recently requested a new One-Time Password (OTP) for your account. Please use the following OTP to complete your request:";
    const subject = "Your One-Time Password (OTP) Request";
    const { otp } = generateOTP();
    const format = createMessage(message, subject, otp);
    const tokenData = {
      otp,
    };

    await insertData("otp", tokenData);
    await sendEmail(email, subject, format);
    return res.status(200).json({
      success: true,
      message: "Your One-Time Password (OTP) Request",
      userId,
    });
  } catch (error) {
    console.error(error);
  }
};

const UpdateApplication = async (req, res) => {
  const { userId } = req.params;
  const application = req.body;
  const updates = {
    ...application,
    updated: true,
  };
  try {
    await updateData("mentors", updates, "userId", userId);
    return res.json({
      success: true,
      message: "Application submitted successfully",
    });
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
      const verifyPassword = bcrypt.compareSync(password, user.password);
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
  const { firstName, initials, skills, bio, How_help, country } = req.body;
  const { userId } = req.params;
  const updates = {
    firstName,
    initials,
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
    experience,
    social_link,
    bio,
    why_mentoring,
    telNumber,
  } = req.body;
  const updates = {
    job_title,
    industry,
    social_link,
    bio,
    experience,
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

const ResetPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  try {
    const checkEmail = await selectData("mentors", "email", email);
    if (checkEmail.length == 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(password, salt);
    const update = { password: hashed };
    await updateData("mentors", update, "email", email);
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
  }
};

const UpdatePassword = async (req, res) => {
  const { userId } = req.params;
  const { password, confirmPassword } = req.body;
  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(password, salt);
    const update = { password: hashed };
    await updateData("mentors", update, "userId", userId);
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
  }
};

const paymentDetails = async (req, res) => {
  const { userId } = req.params;
  try {
    const data = await getPaymentDetails(userId);
    return res.json({ message: "received", payment: data });
  } catch (error) {
    console.log(error);
  }
};

const getMyMentees = async (req, res) => {
  const { userId } = req.params;
  try {
    const data = await getMenteeSubscribed(userId);
    return res.json({ message: "received", subscribed: data });
  } catch (error) {
    console.log(error);
  }
};

const countReview = async (req, res) => {
  const { userId } = req.params;
  try {
    const data = await getReviewCount(userId);
    return res.json({ count: data.length });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllMentors,
  getMentorProfile,
  searchMentor,
  handleSearch,
  Register,
  ConfirmRegistration,
  ResendOtp,
  ResetPassword,
  UpdatePassword,
  UpdateApplication,
  Login,
  Upload,
  updateDetails,
  updateMentorProfile,
  paymentDetails,
  getMyMentees,
  countReview,
};
