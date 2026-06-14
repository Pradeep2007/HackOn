import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<string> => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      console.log(`[Database] Connecting to local MongoDB at: ${mongoUri}`);
      await mongoose.connect(mongoUri);
    } else {
      console.log('[Database] MONGODB_URI not found. Spinning up In-Memory MongoDB server (will download MongoDB binary if not cached)...');
      // Spin up an in-memory MongoDB server
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      
      // Connect Mongoose to it
      await mongoose.connect(mongoUri);
    }
    
    console.log(`[Database] Connected successfully to: ${mongoUri}`);
    return mongoUri;
  } catch (error) {
    console.error('[Database] Connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('[Database] Disconnected successfully.');
  } catch (error) {
    console.error('[Database] Disconnection error:', error);
  }
};
