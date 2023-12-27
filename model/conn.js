const mysql = require("mysql2");

const connectDB = () => {
  const pool = mysql.createPool({
    host: process.env.DBHOST ?? "localhost",
    user: process.env.DBUSER ?? "root",
    password: process.env.DBPASSWORD ?? "",
    database: process.env.DATABASE ?? "holdingHands",
    connectionLimit: 10,
    waitForConnections: true,
  });
  pool.getConnection((err, connection) => {
    if (err) {
      console.log({ error: err.message });
    }
    console.log("Connected successfully");
    connection.release();
  });
};

module.exports = connectDB;
