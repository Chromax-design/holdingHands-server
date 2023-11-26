const bodyparser = require('body-parser');
const stripe = require("stripe")(
  "sk_test_51N2arXIYmnZ4DnJJvdhuSNisgQ3UPhiAC7ZP9YmvKBlMSwNvw713RRa2XJ3JKYTOuMq1Duzs19PCVDsvdZjL3Kyt00engCA6v9"
);

const webHook = (req, res) => {
  const payload = req.body;
  const sig = req.headers["stripe-signature"];
  const endpointSecret =
    "whsec_0aca88c34f921fe2deb64308d4610653243e1f8a0cb34f9ca2c1aa22a879e57f";

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return res.status(400).send("Webhook Error: Invalid signature");
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // You can now access information about the successful payment in `session`

    // Perform actions like storing the payment information in your database
    // Example: savePaymentInDatabase(session);

    console.log("Payment succeeded:", session);
  }

  // Send a response to acknowledge receipt of the event
  res.json({ received: true });
};

const CheckoutSession = async (req, res) => {
  const { product } = req.body;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
          },
          unit_amount: product.price * 100,
        },
        quantity: product.quantity,
      },
    ],
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/stripe/success`,
    cancel_url: `${process.env.FRONTEND_URL}/stripe/cancel`,
  });
  res.json({ id: session.id });
};
module.exports = {
  CheckoutSession,
  webHook,
};
