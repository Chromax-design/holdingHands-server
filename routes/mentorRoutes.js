const express = require("express");
const {
  Register,
  ResetPassword,
  UpdateApplication,
  Login,
  Upload,
  updateMentorProfile,
  updateDetails,
  getAllMentors,
  getMentorProfile,
  searchMentor,
  handleSearch,
  getMyMentees,
  paymentDetails,
  countReview,
  ConfirmRegistration,
  ResendOtp,
  UpdatePassword,
} = require("../controllers/mentorControllers");
const multer = require("multer");
const mentorRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

mentorRouter.get("/", getAllMentors);
mentorRouter.get("/:userId", getMentorProfile);
mentorRouter.get("/search/:industry", searchMentor);
mentorRouter.post("/search", handleSearch);

mentorRouter.post("/register", Register);
mentorRouter.put("/confirm-registration/:userId", ConfirmRegistration);
mentorRouter.post("/resend-otp", ResendOtp);
mentorRouter.post("/password-reset", ResetPassword);
mentorRouter.put("/update-password/:userId", UpdatePassword);
mentorRouter.post("/login", Login);

mentorRouter.put("/application/:userId", UpdateApplication);
mentorRouter.put("/upload/:userId", upload.single("file"), Upload);
mentorRouter.put("/userdetails/:userId", updateDetails);
mentorRouter.put("/mentorprofile/:userId", updateMentorProfile);

mentorRouter.get("/reviews/:userId", countReview);

mentorRouter.get("/payments/:userId", paymentDetails);
mentorRouter.get("/myMentees/:userId", getMyMentees);

module.exports = mentorRouter;
