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
const secret = process.env.JWT_SECRET || 'api-burger-queen';
const adminEmail = process.env.ADMIN_EMAIL || 'admin'
const adminPassword = process.env.ADMIN_PASSWORD || 'admin'

// node
const port =  process.argv[2] || process.env.PORT || 8080;

module.exports = {
  dbConfig,
  secret,
  adminEmail,
  adminPassword,
  port
};