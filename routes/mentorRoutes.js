const express = require("express");
const {
  Register,
  verifyEmail,
  updateApplication,
  Login,
  Upload,
  updateMentorProfile,
  sendPwdResetLink,
  verifyPwdLink,
  updatePassword,
  updateDetails,
  sendResetToken,
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
mentorRouter.get("/verifyEmail", verifyEmail);
mentorRouter.put("/application/:userId", updateApplication);
mentorRouter.post("/login", Login);
mentorRouter.put("/upload/:userId", upload.single("file"), Upload);
mentorRouter.put("/userdetails/:userId", updateDetails);
mentorRouter.put("/mentorprofile/:userId", updateMentorProfile);
mentorRouter.post("/sendpwdResetLink", sendPwdResetLink);
mentorRouter.post("/sendResetToken", sendResetToken);
mentorRouter.get("/verifyPasswordResetLink", verifyPwdLink);
mentorRouter.put("/updatePassword/:userId", updatePassword);

module.exports = mentorRouter;
