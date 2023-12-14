const mysql = require("mysql2");

const connectDB = () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DBHOST,
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      database: process.env.DATABASE,
      connectionLimit: 10,
      waitForConnections: true,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    pool.getConnection((err) => {
      if (err) console.log(err);
      console.log("Connected successfully");
      pool.releaseConnection();
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
