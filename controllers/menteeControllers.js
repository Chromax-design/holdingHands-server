const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const { insertData, selectData, updateData } = require("../utils/sqlHandlers");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dm7rsnfaj",
  api_key: 158634195245211,
  api_secret: "X5XpIpJG-jBLi84rQWsNuzu0Hg8",
});

const { genAccessToken } = require("../utils/utilities");
const {
  getPaymentDetails,
  getMentorSubscribed,
  getReviewData,
  checkSub,
} = require("../utils/menteeSqlHandlers");

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

    const { insertId } = await insertData("mentees", user);
    return res.status(200).json({
      success: true,
      message: "Success! Please update your application",
      userId: insertId,
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
      await updateData("mentees", update, "id", userId);
      return res.status(200).json({ message: "Password updated successfully" });
    } else {
      return res.status(400).json({ message: "Passwords do not match" });
    }
  } catch (error) {
    console.log(error);
  }
};

const checkEmail = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  const data = await selectData("mentees", "email", email);
  if (data.length == 0) {
    return res.status(404).json({ message: "Email not found" });
  }
  res.json({ valid: true, userId: data[0].id });
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
  const updated = await updateData("mentees", updates, "id", userId);
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
        initials: "",
        email,
        userId: uuidv4(),
        password: "",
      };
      await insertData("mentees", userData);
      const newData = await selectData("mentees", "email", email);
      return res.json({
        message: "Registration was successful",
        ...newData[0],
      });
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
  const { firstName, initials, dob, country, bio } = req.body;
  const { userId } = req.params;
  const updates = {
    firstName,
    initials,
    dob,
    country,
    bio,
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

const paymentDetails = async (req, res) => {
  const { userId } = req.params;
  try {
    const data = await getPaymentDetails(userId);
    return res.json({ message: "received", payment: data });
  } catch (error) {
    console.log(error);
  }
};

const getMyMentors = async (req, res) => {
  const { userId } = req.params;
  try {
    const data = await getMentorSubscribed(userId);
    return res.json({ message: "received", subscribed: data });
  } catch (error) {
    console.log(error);
  }
};

const handleReviews = async (req, res) => {
  const review = req.body;
  try {
    await insertData("reviews", review);
    return res.status(200).json({ message: "Review submitted" });
  } catch (error) {
    console.log(error);
  }
};

const getReviews = async (req, res) => {
  const { mentorId } = req.params;
  try {
    const data = await getReviewData(mentorId);
    return res.status(200).json({ mentorId, reviews: data });
  } catch (error) {
    console.log(error);
  }
  return res.json({ message: "received" });
};

const checkSubscribed = async (req, res) => {
  const { mentor, mentee } = req.params;
  try {
    const data = await checkSub(mentor, mentee);
    // console.log(data)
    if (data.length == 0) {
      return res.json({ expired: true });
    }
    if (data[0].expired == false) {
      return res.json({ expired: false });
    } else {
      return res.json({ expired: true });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllMentees,
  getMenteeDetails,
  Register,
  checkEmail,
  resetPwd,
  updateApplication,
  Login,
  loginWithGoogle,
  Upload,
  updateDetails,
  updateMenteeProfile,
  paymentDetails,
  getMyMentors,
  handleReviews,
  getReviews,
  checkSubscribed,
};
