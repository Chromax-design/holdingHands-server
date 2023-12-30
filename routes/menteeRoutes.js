const express = require("express");
const {
  Register,
  updateApplication,
  Login,
  loginWithGoogle,
  Upload,
  updateMenteeProfile,
  updateDetails,
  getMenteeDetails,
  getAllMentees,
  paymentDetails,
  getMyMentors,
  handleReviews,
  getReviews,
  checkSubscribed,
  ConfirmRegistration,
  ResendOtp,
  ResetPassword,
  UpdatePassword,
} = require("../controllers/menteeControllers");
const multer = require("multer");
const checkSubscriptionExpiration = require("../middlewares/checkSubscription");

const menteeRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

menteeRouter.get("/", getAllMentees);
menteeRouter.get("/:userId", getMenteeDetails);

menteeRouter.post("/register", Register);
menteeRouter.put("/confirm-registration/:userId", ConfirmRegistration);
menteeRouter.post("/resend-otp", ResendOtp);
menteeRouter.post("/password-reset", ResetPassword);
menteeRouter.put("/update-password/:userId", UpdatePassword);

menteeRouter.post("/login", Login);
menteeRouter.post("/loginWithGoogle", loginWithGoogle);

menteeRouter.put("/application/:userId", updateApplication);
menteeRouter.put("/upload/:userId", upload.single("file"), Upload);
menteeRouter.put("/userdetails/:userId", updateDetails);
menteeRouter.put("/menteeprofile/:userId", updateMenteeProfile);

menteeRouter.post("/reviews", handleReviews);
menteeRouter.get("/reviews/:mentorId", getReviews);

menteeRouter.get("/payments/:userId", paymentDetails);
menteeRouter.get("/checkSubscribed/:mentor/:mentee", checkSubscribed);
menteeRouter.get(
  "/myMentors/:userId",
  checkSubscriptionExpiration,
  getMyMentors
);

module.exports = menteeRouter;
