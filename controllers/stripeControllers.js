const { insertData } = require("../utils/sqlHandlers");

const stripe = require("stripe")(
  "sk_test_51N2arXIYmnZ4DnJJvdhuSNisgQ3UPhiAC7ZP9YmvKBlMSwNvw713RRa2XJ3JKYTOuMq1Duzs19PCVDsvdZjL3Kyt00engCA6v9"
);

const StripeCheckout = async (req, res) => {
  const { product } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
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
      client_reference_id: product.menteeId,
    });

    const checkObject = {
      amount: product.price,
      mentor_Id: product.mentorId,
      mentee_Id: product.menteeId,
    };
    // await insertData("subscription", checkObject);

    console.log(checkObject);
    res.json({ id: session.id });
  } catch (error) {
    console.log(error);
  }
};

const StripeWebhook = (req, res) => {
  const event = req.body;
  const session = event.data.object;
  const userId = session.client_reference_id;
  try {
    switch (event.type) {
      case "checkout.session.completed":
        console.log(userId);
        console.log(session);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.log(error);
  }

  res.json({ received: true });
};

module.exports = {
  StripeCheckout,
  StripeWebhook,
};
