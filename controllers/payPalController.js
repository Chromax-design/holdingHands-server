const { insertData } = require("../utils/sqlHandlers");

const payPalController = async (req, res) => {
  const { details, checkOut } = req.body;
  // console.log(details);

  try {
    if (details.status === "COMPLETED") {
      const payment = {
        mentor_Id: checkOut.mentorId,
        mentee_id: checkOut.menteeId,
        amount: checkOut.price,
        payment_Id: details.id,
        payment_status: details.status,
        payment_method: 'paypal',
        expired: false,
      };
      console.log(payment);
      await insertData("subscription", payment);
      res
        .status(200)
        .json({ received: true, message: "Payment was successful" });
    } else {
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
