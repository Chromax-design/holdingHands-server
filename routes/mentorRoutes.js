const express = require("express");
const {
  Register,
  verifyEmailOTP,
  resendEmailOTP,
  sendPwdResetOTP,
  verifyPwdOTP,
  resetPwd,
  updateApplication,
  Login,
  Upload,
  updateMentorProfile,
  updateDetails,
  getAllMentors,
  getMentorProfile,
  searchMentor,
} = require("../controllers/mentorControllers");
const multer = require("multer");
const mentorRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

mentorRouter.get("/", getAllMentors);
mentorRouter.get("/:userId", getMentorProfile)
mentorRouter.get("/search/:industry", searchMentor);

mentorRouter.post("/register", Register);
mentorRouter.post("/verifyEmail", verifyEmailOTP);
mentorRouter.post("/resendEmailOTP", resendEmailOTP);

mentorRouter.post("/sendpwdResetOTP", sendPwdResetOTP);
mentorRouter.post("/verifyPwdOTP", verifyPwdOTP);
mentorRouter.put("/resetpwd/:userId", resetPwd);

mentorRouter.post("/login", Login);
mentorRouter.put("/application/:userId", updateApplication);
mentorRouter.put("/upload/:userId", upload.single("file"), Upload);
mentorRouter.put("/userdetails/:userId", updateDetails);
mentorRouter.put("/mentorprofile/:userId", updateMentorProfile);

module.exports = mentorRouter;
