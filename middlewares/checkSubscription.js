const moment = require("moment");
const mysql = require("mysql2/promise");
const { updateData, selectData } = require("../utils/sqlHandlers");
const pool = mysql.createPool({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

// const pool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "holdinghands",
//   waitForConnections: true,
//   connectionLimit: 10,
// });

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
