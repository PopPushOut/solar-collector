const dotenv = require('dotenv').config();
module.exports = {
  username: process.env.SN_USERNAME,
  password: process.env.SN_PASSWORD,
  instanceUrl: process.env.SN_INSTANCE_URL
};
