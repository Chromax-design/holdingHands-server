const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const menteeRouter = require("./routes/menteeRoutes");
const connectDB = require("./model/conn");
const mentorRouter = require("./routes/mentorRoutes");
const chatRouter = require("./routes/chatRoutes");
const messageRouter = require("./routes/messageRoutes");
const stripeRouter = require("./routes/stripeRoutes");
const { app, server } = require("./socket/socket");

dotenv.config();
const corsOptions = {
  origin: "https://holdinghands.onrender.com",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Enable cookies and HTTP authentication with credentials
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mentee routes
app.use("/mentee", menteeRouter);
app.use("/mentor", mentorRouter);
app.use("/", chatRouter, messageRouter);
// app.use("/stripe", stripeRouter);
app.use(express.static("ChatDocs"));

const stripe = require("stripe")(
  "sk_test_51N2arXIYmnZ4DnJJvdhuSNisgQ3UPhiAC7ZP9YmvKBlMSwNvw713RRa2XJ3JKYTOuMq1Duzs19PCVDsvdZjL3Kyt00engCA6v9"
);

const endpointSecret = "whsec_0aca88c34f921fe2deb64308d4610653243e1f8a0cb34f9ca2c1aa22a879e57f";

app.post('/stripe/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // You can now access information about the successful payment in `session`

    // Perform actions like storing the payment information in your database
    // Example: savePaymentInDatabase(session);

    console.log("Payment succeeded:", session);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

app.post("/stripe/create-checkout-session", async (req, res) => {
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
})

connectDB();

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
