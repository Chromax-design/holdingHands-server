const moment = require("moment");
const { updateData, selectData } = require("../utils/sqlHandlers");

const checkSubscriptionExpiration = async (req, res, next) => {
  const { userId } = req.params;
  const results = await selectData(
    "subscription",
    "mentee_id",
    userId,
    "subscribed_at"
  );
  if (results.length == 0) {
    return res.status(403).json({ error: "No subscription found." });
  }

  for (const subscription of results) {
    const paymentTimestamp = moment(subscription.subscribed_at);
    const expirationDate = paymentTimestamp.add(1, "months");
    // const expirationDate = paymentTimestamp.add(12, "hours");
    const currentDate = moment();

    // Check if the subscription has expired
    if (currentDate.isAfter(expirationDate)) {
      // Subscription has expired, perform any necessary actions
      const updates = {
        expired: true,
      };
      await updateData("subscription", updates, "mentee_id", userId);
      console.log("Subscription has expired for user:", userId);
      return res
        .status(403)
        .json({ expired: true, error: "Subscription has expired." });
    }
  }

  next();
};

module.exports = checkSubscriptionExpiration;
