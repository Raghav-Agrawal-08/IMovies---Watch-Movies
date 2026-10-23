const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri && mongoUri.trim() !== '' && !mongoUri.includes('YOUR_MONGODB_URI')) {
      console.log('Connecting to specified MongoDB URI...');
      const conn = await mongoose.connect(mongoUri);
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
      return;
    }

    console.log('[Database] No external MONGODB_URI found. Initializing built-in in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const conn = await mongoose.connect(uri);
    console.log(`[Database] In-Memory MongoDB started and connected: ${conn.connection.host}`);
    console.log('[Database] Ready for seamless local testing! To persist across server restarts, supply MONGODB_URI in .env');
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('Error disconnecting DB:', err);
  }
};

module.exports = { connectDB, disconnectDB };
