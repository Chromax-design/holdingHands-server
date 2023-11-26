const express = require("express");
const {
  CheckoutSession,
  webHook,
} = require("../controllers/stripeControllers");
const bodyParser = require("body-parser");
const stripeRouter = express.Router();

stripeRouter.post("/create-checkout-session", CheckoutSession);
stripeRouter.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  webHook
);
module.exports = stripeRouter;
