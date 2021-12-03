require('dotenv').config()

// telling eslint process is defined elsewhere
/* global process */
const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI

module.exports = {
  MONGODB_URI,
  PORT,
}