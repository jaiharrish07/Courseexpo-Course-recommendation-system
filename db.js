// config/db.js
const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  max: 10

});

pool.on("error", (err) => {
  console.error("Unexpected DB error", err);
  process.exit(-1);
});

module.exports = pool;
