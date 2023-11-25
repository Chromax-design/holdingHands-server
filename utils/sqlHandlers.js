const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  database: process.env.DATABASE,
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

const selectData = async (tableName, identifier, value) => {
  let sql = `SELECT * FROM ${tableName}`;
  if (identifier && value) {
   sql = `SELECT * FROM ${tableName} WHERE ${identifier} = ?`;
  }
  const [rows] = await pool.query(sql, [value], (err) => {
    if (err) {
      console.error(err);
    }
  });
  return rows;
};

const deleteData = async (tableName, identifier, value) => {
  const sql = `DELETE FROM ${tableName} WHERE ${identifier} =?`;
  await pool.query(sql, [value], (err) => {
    if (err) {
      console.error(err);
    }
  });
};

const updateData = async(tableName, updates, identifier, value)=>{
  const sql = `UPDATE ${tableName} SET ? WHERE ${identifier} = ?`
  await pool.query(sql, [updates, value], (err)=>{
    if (err) {
      console.error(err);
      return false
    }
    return true
  })
}

module.exports = {
  insertData,
  selectData,
  deleteData,
  updateData
};
