import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🚀 ===================================================
  🎯 CareerSync Express Server is Running!
  📡 Environment : ${process.env.NODE_ENV || 'development'}
  🌐 Port        : http://localhost:${PORT}
  ===================================================
  `);
});
