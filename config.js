require('dotenv').config();

// auth
const secret = process.env.JWT_SECRET || 'esta-es-la-api-burger-queen';

// node
const port =  process.argv[2] || process.env.PORT || 8080;

module.exports = {
  secret,
  port
};