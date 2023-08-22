require('dotenv').config();

// db
const dbConfig = {
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT,
};

// auth
const secret = process.env.JWT_SECRET || 'esta-es-la-api-burger-queen';

// node
const port =  process.argv[2] || process.env.PORT || 8080;

module.exports = {
  dbConfig,
  secret,
  port
};