const { insertData, updateData } = require("../utils/sqlHandlers");

const stripe = require("stripe")(
  // "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"
  "pk_test_51N2arXIYmnZ4DnJJ1gSvYCDhGFLAVDTHGPo8vTJTdJPnioyLZYnYAJUho80iMQsHPLXRbFD0SYqyt4y1hmps79ci00xEmplYtF"
);

const StripeCheckout = async (req, res) => {
  const { checkOut } = req.body;
  console.log(checkOut);
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: checkOut.name,
            },
            unit_amount: checkOut.price * 100,
          },
          quantity: checkOut.quantity,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/stripe/success`,
      cancel_url: `${process.env.FRONTEND_URL}/stripe/cancel`,
      client_reference_id: checkOut.menteeId,
    });

    const checkOutObject = {
      mentor_Id: checkOut.mentorId,
      mentee_Id: checkOut.menteeId,
      amount: checkOut.price,
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
          expired: false,
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
