const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbType = process.env.DB_TYPE || 'sqlite';
let dbConnection;

if (dbType === 'sqlite') {
  const dbPath = path.join(__dirname, '../database.sqlite');
  console.log(`[Database] Connecting to SQLite database at ${dbPath}`);
  
  const sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('[Database] Failed to open SQLite database:', err.message);
    }
  });

  // Helper to run query and return array of objects (mimicking mysql2 results format)
  dbConnection = {
    type: 'sqlite',
    query: (sql, params = []) => {
      // Convert MySQL style '?' syntax parameterization to SQLite standard if needed
      // SQLite supports standard '?' parameterization, so we can pass params straight through
      return new Promise((resolve, reject) => {
        // Determine query type to call appropriate SQLite method
        const trimmedSql = sql.trim().toLowerCase();
        
        if (trimmedSql.startsWith('select') || trimmedSql.startsWith('show') || trimmedSql.startsWith('describe')) {
          sqliteDb.all(sql, params, (err, rows) => {
            if (err) {
              console.error(`[SQLite Error] Query: ${sql} | Params: ${JSON.stringify(params)} | Error:`, err.message);
              return reject(err);
            }
            resolve([rows]); // return [rows, fields] format
          });
        } else {
          sqliteDb.run(sql, params, function (err) {
            if (err) {
              console.error(`[SQLite Error] Query: ${sql} | Params: ${JSON.stringify(params)} | Error:`, err.message);
              return reject(err);
            }
            
            // Format insertId or affectedRows to match MySQL output
            const resultInfo = {
              insertId: this.lastID,
              affectedRows: this.changes
            };
            resolve([resultInfo]);
          });
        }
      });
    }
  };
} else {
  console.log('[Database] Connecting to MySQL database...');
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'rootpassword',
    database: process.env.DB_NAME || 'handloom_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  dbConnection = {
    type: 'mysql',
    query: async (sql, params = []) => {
      try {
        const [results, fields] = await pool.query(sql, params);
        return [results, fields];
      } catch (err) {
        console.error(`[MySQL Error] Query: ${sql} | Error:`, err.message);
        throw err;
      }
    }
  };
}

module.exports = dbConnection;
