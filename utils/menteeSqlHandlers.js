const mysql = require("mysql2/promise");
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

const getPaymentDetails = async (value) => {
  const sql = `SELECT subscription.amount, subscription.payment_Id, subscription.payment_status, subscription.subscribed_at, mentors.firstName, mentors.initials FROM subscription JOIN mentors ON subscription.mentor_Id = mentors.id WHERE subscription.mentee_Id = ?`;
  const [rows] = await pool.query(sql, [value], (err) => {
    if (err) {
      console.error(err);
    }
  });
  return rows;
};

const getMentorSubscribed = async (value) => {
  const sql = `SELECT mentors.id, mentors.firstName, mentors.initials, mentors.image, mentors.industry, mentors.bio FROM subscription JOIN mentors ON subscription.mentor_Id = mentors.id WHERE subscription.mentee_Id = ?`;
  const [row] = await pool.query(sql, [value], (err) => {
    if (err) {
      console.error(err);
    }
  });
  return row;
};

module.exports = {
  getPaymentDetails,
  getMentorSubscribed
};
