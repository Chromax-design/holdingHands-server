const mysql = require("mysql2");
const config = require("./config");

const connectDB = () => {
  const pool = mysql.createPool(config);
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(err);
    }
    console.log(`database connected successfully...`);
    connection.release();
  });
};

module.exports = connectDB;
