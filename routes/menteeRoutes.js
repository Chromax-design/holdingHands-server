const express = require("express");
const {
  Register,
  verifyEmailOTP,
  resendEmailOTP,
  updateApplication,
  Login,
  sendPwdResetOTP,
  verifyPwdOTP,
  resetPwd,
  Upload,
  updateMenteeProfile,
  updateDetails,
  getMenteeDetails,
  getAllMentees,
} = require("../controllers/menteeControllers");
const multer = require("multer");

const menteeRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

menteeRouter.get("/", getAllMentees);
menteeRouter.get("/:userId", getMenteeDetails);

menteeRouter.post("/register", Register);
menteeRouter.post("/verifyEmail", verifyEmailOTP);
menteeRouter.post("/resendEmailOTP", resendEmailOTP);

menteeRouter.post("/sendpwdResetOTP", sendPwdResetOTP);
menteeRouter.post("/verifyPwdOTP", verifyPwdOTP);
menteeRouter.put("/resetPwd/:userId", resetPwd);

menteeRouter.put("/application/:userId", updateApplication);
menteeRouter.post("/login", Login);
menteeRouter.put("/upload/:userId", upload.single("file"), Upload);
menteeRouter.put("/userdetails/:userId", updateDetails);
menteeRouter.put("/menteeprofile/:userId", updateMenteeProfile);

module.exports = menteeRouter;
