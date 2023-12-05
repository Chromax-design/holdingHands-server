const express = require("express");
const { payPalController } = require("../controllers/payPalController");
const payPalRouter = express.Router();

payPalRouter.post("/payWithPayPal", payPalController);

module.exports = payPalRouter;
