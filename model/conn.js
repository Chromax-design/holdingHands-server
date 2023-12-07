const mysql = require("mysql2");

const connectDB = () => {
  const pool = mysql.createPool({
    host: process.env.DBHOST ?? "localhost",
    user: process.env.DBUSER ?? "root",
    password: process.env.DBPASSWORD ?? "",
    database: process.env.DATABASE ?? "holdinghands",
    waitForConnections: true,
    connectionLimit: 10,
  });
  pool.getConnection((err, conn) => {
    if (err) console.log(err);
    console.log("Connected successfully");
  });
};

module.exports = connectDB;
