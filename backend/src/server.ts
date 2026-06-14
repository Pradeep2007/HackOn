import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDB } from './config/db';
import { seedDatabase } from './config/seed';
import apiRouter from './routes/api';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Mount routes
app.use('/api', apiRouter);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start server
const startServer = async () => {
  try {
    // 1. Connect database (mongodb-memory-server)
    await connectDB();

    // 2. Seed default data
    await seedDatabase();

    // 3. Listen on Port
    app.listen(PORT, () => {
      console.log(`[Server] Express server running on port ${PORT}`);
      console.log(`[Server] Health Check available at http://localhost:${PORT}/health`);
      console.log(`[Server] Uploads served at http://localhost:${PORT}/uploads/`);
    });
  } catch (error) {
    console.error('[Server] Bootstrapping failed:', error);
    process.exit(1);
  }
};

startServer();
