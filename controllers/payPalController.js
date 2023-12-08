const { insertData } = require("../utils/sqlHandlers");

const payPalController = async (req, res) => {
  const { details, product } = req.body;
  // console.log(details);

  try {
    if (details.status === "COMPLETED") {
      const payment = {
        mentor_Id: product.mentorId,
        mentee_id: product.menteeId,
        amount: details.payment_units[0].value,
        payment_Id: details.id,
        payment_status: details.status,
        expired: false,
      };
      console.log(payment);
      await insertData("subscription", payment);
      res
        .status(200)
        .json({ received: true, message: "Payment was successful" });
    } else {
      // Payment is not successful
      res.status(400).json({ message: "Payment failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  payPalController,
};
