
const payPalController = async (req, res) => {
  const { details } = req.body;
  console.log(details);

  try {
    

    // Handle the response from PayPal
    // const { status, id } = response.data;
    // console.log(response.data);
    // if (status === "COMPLETED") {
    //   // Payment is successful
    //   // Perform further actions on your server
    //   res.status(200).send("Payment successful");
    // } else {
    //   // Payment is not successful
    //   res.status(400).send("Payment failed");
    // }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  payPalController,
};
