const mysql = require("mysql2");
const config = require("./config");

const connectDB = () => {
  const pool = mysql.createPool({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
  });
  pool.getConnection((err, conn) => {
    if (err) console.log(err);
    console.log("Connected successfully");
  });
};


module.exports = connectDB;
