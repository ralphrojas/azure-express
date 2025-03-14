const sql = require("mssql");

const config = {
  server: process.env.DB_SERVER || "",
  database: process.env.DB_NAME || "",
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

const connectDB = async () => {
  try {
    if (!pool) {
      pool = await new sql.ConnectionPool(config).connect();
      console.log("Database connection established successfully.");
    }
    return pool;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error(
      "Database connection not initialized. Call connectDB() first."
    );
  }
  return pool;
};

module.exports = { sql, getPool, connectDB };
