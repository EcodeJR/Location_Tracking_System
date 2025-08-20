const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is required in .env');

  mongoose.set('strictQuery', false);
  await mongoose.connect(uri, {
    dbName: process.env.MONGO_DBNAME || undefined
  });

  console.log('MongoDB connected');
}

module.exports = { connectDB };