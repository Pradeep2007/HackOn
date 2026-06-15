"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./config/db");
const seed_1 = require("./config/seed");
const api_1 = __importDefault(require("./routes/api"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable CORS
app.use((0, cors_1.default)());
// Body parser middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static upload directory
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Mount routes
app.use('/api', api_1.default);
// Basic health check route
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});
// Start server
const startServer = async () => {
    try {
        // 1. Connect database (mongodb-memory-server)
        await (0, db_1.connectDB)();
        // 2. Seed default data
        await (0, seed_1.seedDatabase)();
        // 3. Listen on Port
        app.listen(PORT, () => {
            console.log(`[Server] Express server running on port ${PORT}`);
            console.log(`[Server] Health Check available at http://localhost:${PORT}/health`);
            console.log(`[Server] Uploads served at http://localhost:${PORT}/uploads/`);
        });
    }
    catch (error) {
        console.error('[Server] Bootstrapping failed:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
