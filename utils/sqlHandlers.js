const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: process.env.DBHOST ?? "localhost",
  user: process.env.DBUSER ?? "root",
  password: process.env.DBPASSWORD ?? "",
  database: process.env.DATABASE ?? "holdinghands",
  waitForConnections: true,
  connectionLimit: 10,
});

const insertData = async (tableName, data) => {
  const sql = `INSERT INTO ${tableName} SET ?`;
  const [rows] = await pool.query(sql, [data], (err) => {
    if (err) {
      console.error(err);
    }
  });
  return rows;
};

const selectData = async (tableName, identifier, value, columnName) => {
  let sql = `SELECT * FROM ${tableName}`;
  if (identifier && value) {
    sql = `SELECT * FROM ${tableName} WHERE ${identifier} = ?`;
  }

  if (columnName) {
    // Selecting a specific column
    sql = `SELECT ${columnName} FROM ${tableName}`;
    if (identifier && value) {
      sql = `SELECT ${columnName} FROM ${tableName} WHERE ${identifier} = ?`;
    }
  }

  try {
    const [rows] = await pool.query(sql, [value]);
    return rows;
  } catch (error) {
    console.error(error);
    throw error; // You might want to handle or log the error appropriately
  }
};

const deleteData = async (tableName, identifier, value) => {
  const sql = `DELETE FROM ${tableName} WHERE ${identifier} =?`;
  await pool.query(sql, [value], (err) => {
    if (err) {
      console.error(err);
    }
  });
};

const updateData = async (tableName, updates, identifier, value) => {
  const sql = `UPDATE ${tableName} SET ? WHERE ${identifier} = ?`;
  await pool.query(sql, [updates, value], (err) => {
    if (err) {
      console.error(err);
      return false;
    }
    return true;
  });
};

const searchData = async (tableName, identifier, wildcard) => {
  try {
    const sql = `SELECT * FROM ${tableName} WHERE ${identifier} LIKE ?`;
    const [rows] = await pool.query(sql, [`%${wildcard}%`]);
    return rows;
  } catch (err) {
    console.error(err);
    return false;
  }
};

module.exports = {
  insertData,
  selectData,
  deleteData,
  updateData,
  searchData,
};
