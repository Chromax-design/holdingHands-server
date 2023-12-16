const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const {
  insertData,
  selectData,
  searchData,
  updateData,
} = require("../utils/sqlHandlers");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dm7rsnfaj",
  api_key: 158634195245211,
  api_secret: "X5XpIpJG-jBLi84rQWsNuzu0Hg8",
});

const {
  genAccessToken,
} = require("../utils/utilities");
const {
  getMenteeSubscribed,
  getPaymentDetails,
  getReviewCount,
} = require("../utils/mentorSqlHandlers");

const getAllMentors = async (req, res) => {
  const data = await selectData("mentors", "verified", true);
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
  const { firstName, initials, email, password, telNumber } = req.body;
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

  const existingUsers = await selectData("mentors", "email", email);
  if (existingUsers.length > 0) {
    return res
      .status(409)
      .json({ success: false, message: "User already exists" });
  }

  const { insertId } = await insertData("mentors", user);
  console.log(insertId);
  return res.status(200).json({
    success: true,
    message: "Success! Please update your application",
    userId: insertId,
  });
};

const checkEmail = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  const data = await selectData("mentors", "email", email);
  if (data.length == 0) {
    return res.status(404).json({ message: "Email not found" });
  }
  res.json({ valid: true, userId: data[0].id });
};

const updateApplication = async (req, res) => {
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
    experience,
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
  const {
    firstName,
    initials,
    skills,
    bio,
    How_help,
    country,
  } = req.body;
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

const resetPwd = async (req, res) => {
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

const paymentDetails = async (req, res) => {
  const { userId } = req.params;
  try {
    const data = await getPaymentDetails(userId);
    // console.log(data);
    return res.json({ message: "received", payment: data });
  } catch (error) {
    console.log(error);
  }
};

const getMyMentees = async (req, res) => {
  const { userId } = req.params;
  try {
    const data = await getMenteeSubscribed(userId);
    // console.log(data)
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
  checkEmail,
  resetPwd,
  updateApplication,
  Login,
  Upload,
  updateDetails,
  updateMentorProfile,
  paymentDetails,
  getMyMentees,
  countReview,
};
