const mysql = require("mysql2");

const connectDB = () => {
  const pool = mysql.createPool({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DATABASE,
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
