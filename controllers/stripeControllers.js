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
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      // const paymentIntentId = session.payment_intent;
      // const amountPaid = session.amount_total / 100;
      const userId = session.client_reference_id;
      console.log(userId);
      break;
    case "payment_intent.amount_capturable_updated":
      const paymentIntentAmountCapturableUpdated = event.data.object;
      console.log(paymentIntentAmountCapturableUpdated);
      // Then define and call a function to handle the event payment_intent.amount_capturable_updated
      break;
    case "payment_intent.canceled":
      const paymentIntentCanceled = event.data.object;
      console.log(paymentIntentCanceled);
      // Then define and call a function to handle the event payment_intent.canceled
      break;
    case "payment_intent.created":
      const paymentIntentCreated = event.data.object;
      console.log('created');
      // Then define and call a function to handle the event payment_intent.created
      break;
    case "payment_intent.partially_funded":
      const paymentIntentPartiallyFunded = event.data.object;
      console.log(paymentIntentPartiallyFunded);
      // Then define and call a function to handle the event payment_intent.partially_funded
      break;
    case "payment_intent.payment_failed":
      const paymentIntentPaymentFailed = event.data.object;
      console.log(paymentIntentPaymentFailed);
      // Then define and call a function to handle the event payment_intent.payment_failed
      break;
    case "payment_intent.processing":
      const paymentIntentProcessing = event.data.object;
      console.log(paymentIntentProcessing);
      // Then define and call a function to handle the event payment_intent.processing
      break;
    case "payment_intent.requires_action":
      const paymentIntentRequiresAction = event.data.object;
      console.log(paymentIntentRequiresAction);

      // Then define and call a function to handle the event payment_intent.requires_action
      break;
    case "payment_intent.succeeded":
      const paymentIntentSucceeded = event.data.object;
      const dbObject = {
        paymentId: paymentIntentSucceeded.id,
        paymentStatus: paymentIntentSucceeded.status,
        amountPaid: paymentIntentSucceeded.amount,
        // clientId: userId,
      };
      console.log(dbObject);
      //   console.log(session)
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

module.exports = {
  StripeCheckout,
  StripeWebhook,
};
