const express = require('express');
const { StripeCheckout, StripeWebhook } = require('../controllers/stripeControllers');
const stripeRouter = express.Router()


stripeRouter.post("/create-checkout-session", StripeCheckout)
stripeRouter.post("/webhook", StripeWebhook )


module.exports = {stripeRouter}