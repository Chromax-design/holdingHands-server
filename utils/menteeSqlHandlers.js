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
  const sql = `SELECT subscription.amount, subscription.payment_Id, subscription.payment_status, subscription.subscribed_at, mentors.firstName, mentors.initials FROM subscription JOIN mentors ON subscription.mentor_Id = mentors.id WHERE subscription.mentee_Id = ? AND subscription.payment_status IS NOT NULL AND subscription.payment_status != ''`;
  const [rows] = await pool.query(sql, [value], (err) => {
    if (err) {
      console.error(err);
    }
  });
  return rows;
};

const getMentorSubscribed = async (value) => {
  const sql = `SELECT mentors.id, mentors.firstName, mentors.initials, mentors.image, mentors.industry, mentors.bio FROM subscription JOIN mentors ON subscription.mentor_Id = mentors.id WHERE subscription.mentee_Id = ? AND subscription.expired = ?`;
  const [row] = await pool.query(sql, [value, false], (err) => {
    if (err) {
      console.error(err);
    }
  });
  return row;
};

const getReviewData = async (mentor)=>{
  const sql = `SELECT mentees.image, mentees.firstName, mentees.initials, reviews.review, reviews.created_at FROM reviews JOIN mentees ON reviews.mentee_Id = mentees.id WHERE reviews.mentor_Id = ?`;
  const [row] = await pool.query(sql, [mentor], (err)=>{
    if (err) {
      console.error(err);
    }
  });
  return row
}

const checkSub = async (mentor)=>{
  const sql = `SELECT expired FROM subscription WHERE mentor_Id = ?`
  const [row] = await pool.query(sql, [mentor], (err)=>{
    if (err) {
      console.error(err);
    }
  })
  return row
}

module.exports = {
  getPaymentDetails,
  getMentorSubscribed,
  getReviewData,
  checkSub
};
