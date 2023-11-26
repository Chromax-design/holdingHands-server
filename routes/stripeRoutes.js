const express = require("express");
const app = express();
const {
  CheckoutSession,
  webHook,
} = require("../controllers/stripeControllers");
const stripeRouter = express.Router();

stripeRouter.post("/create-checkout-session", CheckoutSession);
stripeRouter.post(
  "/webhook",
  webHook
);
module.exports = stripeRouter;
