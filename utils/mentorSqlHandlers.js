const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: process.env.DBHOST ?? "localhost",
  user: process.env.DBUSER ?? "root",
  password: process.env.DBPASSWORD ?? "",
  database: process.env.DATABASE ?? "holdinghands",
  waitForConnections: true,
  connectionLimit: 10,
});

const getPaymentDetails = async (value) => {
  const sql = `SELECT subscription.amount, subscription.payment_Id, subscription.payment_status, subscription.subscribed_at, mentees.firstName, mentees.initials FROM subscription JOIN mentees ON subscription.mentee_Id = mentees.id WHERE subscription.mentor_Id = ?`;
  const [rows] = await pool.query(sql, [value], (err) => {
    if (err) {
      console.error(err);
    }
  });
  return rows;
};

const getMenteeSubscribed = async (value) => {
  const sql = `SELECT mentees.id, mentees.firstName, mentees.initials, mentees.image, mentees.mentor_type, mentees.bio FROM subscription JOIN mentees ON subscription.mentee_Id = mentees.id WHERE subscription.mentor_Id = ? AND expired = ?`;
  const [row] = await pool.query(sql, [value, false], (err) => {
    if (err) {
      console.error(err);
    }
  });
  return row;
};

const getReviewCount = async (value) => {
  const sql = `SELECT * FROM reviews WHERE mentor_Id = ?`;
  const [row] = await pool.query(sql, [value], (err) => {
    if (err) {
      console.error(err);
    }
  });
  return row;
};

module.exports = {
  getPaymentDetails,
  getMenteeSubscribed,
  getReviewCount,
};
