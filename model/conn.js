const mysql = require("mysql2");

const connectDB = () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DBHOST ?? "localhost",
      user: process.env.DBUSER ?? "root",
      password: process.env.DBPASSWORD ?? "",
      database: process.env.DATABASE ?? "holdinghands",
      connectionLimit: 10,
      waitForConnections: true,
    });
    pool.getConnection((err, conn) => {
      if (err) console.log(err);
      console.log("Connected successfully");
      conn.release()
    });
  } catch (error) {
    console.log(error)
  }
};

module.exports = connectDB;
