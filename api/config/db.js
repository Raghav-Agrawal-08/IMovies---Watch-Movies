const mongoose = require('mongoose');

// Serverless Mongoose connection caching for Vercel
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null, mongod: null };
}

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  // 1. If external MongoDB URI (MongoDB Atlas) is provided
  if (mongoUri && mongoUri.trim() !== '' && !mongoUri.includes('YOUR_MONGODB_URI')) {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
      };

      console.log('[Database] Connecting to MongoDB Atlas...');
      cached.promise = mongoose.connect(mongoUri, opts).then((mongooseInstance) => {
        console.log(`[Database] MongoDB Atlas Connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      });
    }

    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (err) {
      cached.promise = null;
      console.error('[Database Error]:', err.message);
      throw err;
    }
  }

  // 2. Running on Vercel without MONGODB_URI
  if (process.env.VERCEL) {
    throw new Error(
      'MONGODB_URI is not configured. Please add your MongoDB Atlas connection string in Vercel Settings -> Environment Variables.'
    );
  }

  // 3. Local Development Fallback: In-Memory MongoDB
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('[Database] No external MONGODB_URI detected in local environment. Starting in-memory MongoDB fallback...');
    cached.promise = (async () => {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      cached.mongod = await MongoMemoryServer.create();
      const localUri = cached.mongod.getUri();
      const conn = await mongoose.connect(localUri);
      console.log(`[Database] In-memory local MongoDB started: ${conn.connection.host}`);
      return conn;
    })();
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (cached.mongod) {
      await cached.mongod.stop();
    }
    cached.conn = null;
    cached.promise = null;
  } catch (err) {
    console.error('Error disconnecting DB:', err);
  }
};

module.exports = { connectDB, disconnectDB };
