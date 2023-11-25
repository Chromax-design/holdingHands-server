const express = require("express");
const {
  Register,
  verifyEmail,
  updateApplication,
  Login,
  Upload,
  updateMenteeProfile,
  sendPwdResetLink,
  verifyPwdLink,
  updatePassword,
  updateDetails,
  getMenteeDetails,
  getAllMentees,
} = require("../controllers/menteeControllers");
const multer = require("multer");
// const MenteeAuth = require("../middlewares/menteeAuth");
const menteeRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

menteeRouter.get("/", getAllMentees);
menteeRouter.get("/:userId", getMenteeDetails);
menteeRouter.post("/register", Register);
menteeRouter.get("/verifyEmail", verifyEmail);
menteeRouter.put("/application/:userId", updateApplication);
menteeRouter.post("/login", Login);
menteeRouter.put("/upload/:userId", upload.single("file"), Upload);
menteeRouter.put("/userdetails/:userId", updateDetails);
menteeRouter.put("/menteeprofile/:userId", updateMenteeProfile);
menteeRouter.post("/sendpwdResetLink", sendPwdResetLink);
menteeRouter.get("/verifyPasswordResetLink", verifyPwdLink);
menteeRouter.put("/updatePassword/:userId", updatePassword);

module.exports = menteeRouter;
