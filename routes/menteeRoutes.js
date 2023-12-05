const express = require("express");
const {
  Register,
  verifyEmailOTP,
  resendEmailOTP,
  updateApplication,
  Login,
  loginWithGoogle,
  sendPwdResetOTP,
  verifyPwdOTP,
  resetPwd,
  Upload,
  updateMenteeProfile,
  updateDetails,
  getMenteeDetails,
  getAllMentees,
  paymentDetails,
  getMyMentors,
} = require("../controllers/menteeControllers");
const multer = require("multer");
const checkSubscriptionExpiration = require("../middlewares/checkSubscription");

const menteeRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

menteeRouter.get("/", getAllMentees);
menteeRouter.get("/:userId", getMenteeDetails);

menteeRouter.post("/register", Register);
menteeRouter.post("/verifyEmail", verifyEmailOTP);
menteeRouter.post("/resendEmailOTP", resendEmailOTP);
menteeRouter.post("/login", Login);
menteeRouter.post("/loginWithGoogle", loginWithGoogle);

menteeRouter.post("/sendpwdResetOTP", sendPwdResetOTP);
menteeRouter.post("/verifyPwdOTP", verifyPwdOTP);
menteeRouter.put("/resetPwd/:userId", resetPwd);

menteeRouter.put("/application/:userId", updateApplication);
menteeRouter.put("/upload/:userId", upload.single("file"), Upload);
menteeRouter.put("/userdetails/:userId", updateDetails);
menteeRouter.put("/menteeprofile/:userId", updateMenteeProfile);

menteeRouter.get("/payments/:userId", paymentDetails);
menteeRouter.get(
  "/myMentors/:userId",
  checkSubscriptionExpiration,
  getMyMentors
);

module.exports = menteeRouter;
