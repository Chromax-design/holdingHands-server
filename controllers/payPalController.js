const axios = require("axios");

const payPalController = async (req, res) => {
  const { orderId } = req.body;
  console.log(req.body);

  try {
    const response = await axios.post(
      "https://api.sandbox.paypal.com/v2/checkout/orders/" +
        orderId +
        "/capture",
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer access_token$sandbox$9ztqgxvxsqm3zjyj$ee466686d1d19582dff0c35162801157",
        },
      }
    );

    // Handle the response from PayPal
    const { status, id } = response.data;
    console.log(response.data);
    if (status === "COMPLETED") {
      // Payment is successful
      // Perform further actions on your server
      res.status(200).send("Payment successful");
    } else {
      // Payment is not successful
      res.status(400).send("Payment failed");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  payPalController,
};
