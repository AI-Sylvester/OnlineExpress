require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Optional: test the connection
pool
  .connect()
  .then(client => {
    console.log('✅ DB Connected');
    client.release(); // release back to pool
  })
  .catch(err => {
    console.error('❌ DB Connection Failed:', err.message);
  });

module.exports = pool;
