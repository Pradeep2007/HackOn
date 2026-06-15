"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let mongoServer = null;
const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGODB_URI;
        if (mongoUri) {
            console.log(`[Database] Connecting to local MongoDB at: ${mongoUri}`);
            await mongoose_1.default.connect(mongoUri);
        }
        else {
            console.log('[Database] MONGODB_URI not found. Spinning up In-Memory MongoDB server (will download MongoDB binary if not cached)...');
            const dbDir = path_1.default.join(process.cwd(), 'tmp/mongodb-data');
            if (!fs_1.default.existsSync(dbDir)) {
                fs_1.default.mkdirSync(dbDir, { recursive: true });
            }
            // Spin up an in-memory MongoDB server
            mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create({
                instance: {
                    dbPath: dbDir,
                    storageEngine: 'ephemeralForTest',
                },
                binary: {
                    version: '7.0.12'
                }
            });
            mongoUri = mongoServer.getUri();
            // Connect Mongoose to it
            await mongoose_1.default.connect(mongoUri);
        }
        console.log(`[Database] Connected successfully to: ${mongoUri}`);
        return mongoUri;
    }
    catch (error) {
        console.error('[Database] Connection error:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await mongoose_1.default.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
        }
        console.log('[Database] Disconnected successfully.');
    }
    catch (error) {
        console.error('[Database] Disconnection error:', error);
    }
};
exports.disconnectDB = disconnectDB;
