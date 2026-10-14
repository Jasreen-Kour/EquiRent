const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/equirent';
  try {
    // Attempt short-timeout connection so it doesn't block the app if MongoDB isn't running
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB not reachable at ${uri}. Operating in Persistent JSON Engine Demo Mode.`);
    console.warn(`[Database] Real disk-persistent storage is active at data/db.json.`);
    return false;
  }
};

const getDbStatus = () => ({
  connectedToMongo: isMongoConnected,
  mode: isMongoConnected ? 'MongoDB (Production Ready)' : 'Persistent JSON Storage (Local Demo Mode)',
  persistenceFile: 'data/db.json'
});

module.exports = { connectDB, getDbStatus, isMongoConnected: () => isMongoConnected };
