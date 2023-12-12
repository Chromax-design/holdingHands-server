const { insertData, updateData } = require("../utils/sqlHandlers");

const stripe = require("stripe")(
  "sk_test_51N2arXIYmnZ4DnJJvdhuSNisgQ3UPhiAC7ZP9YmvKBlMSwNvw713RRa2XJ3JKYTOuMq1Duzs19PCVDsvdZjL3Kyt00engCA6v9"
);

const StripeCheckout = async (req, res) => {
  const { checkout } = req.body;
  console.log(checkout)
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: checkout.name,
            },
            unit_amount: checkout.price,
          },
          quantity: checkout.quantity,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/stripe/success`,
      cancel_url: `${process.env.FRONTEND_URL}/stripe/cancel`,
      client_reference_id: checkout.menteeId,
    });

    const checkOutObject = {
      mentor_Id: checkout.mentorId,
      mentee_Id: checkout.menteeId,
      amount: checkout.price,
      expired: false,
    };

    await insertData("subscription", checkOutObject);
    console.log(checkOutObject);

    res.json({ id: session.id });
  } catch (error) {
    console.log(error);
  }
};

const StripeWebhook = async (req, res) => {
  const event = req.body;
  const session = event.data.object;
  const userId = session.client_reference_id;
  try {
    switch (event.type) {
      case "checkout.session.completed":
        const webHookData = {
          payment_Id: session.payment_intent,
          payment_status: session.payment_status,
          payment_method: "stripe",
        };

        await updateData("subscription", webHookData, "mentee_Id", userId);

        console.log(session);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.log(error);
  }

  res.json({ received: true, message: "Payment was successful" });
};

module.exports = {
  StripeCheckout,
  StripeWebhook,
};
