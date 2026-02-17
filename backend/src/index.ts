// backend/src/index.ts

import dotenv from 'dotenv';
import { createApp } from './app';
import { initializeDatabase, closeDatabase } from './config/database';
import { RedisClient } from './config/redis';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start FitKart Backend Server
 *
 * Initialization sequence:
 * 1. Load environment variables
 * 2. Initialize database connection
 * 3. Initialize Redis client
 * 4. Create and start Express app
 * 5. Setup graceful shutdown
 */
async function main() {
  try {
    console.log(`🚀 Starting FitKart Backend Server...`);
    console.log(`📌 Environment: ${NODE_ENV}`);
    console.log(`🔌 Port: ${PORT}\n`);

    // ============================================
    // Initialize Database
    // ============================================
    console.log('📦 Initializing database connection...');
    const AppDataSource = await initializeDatabase();

    if (!AppDataSource) {
      throw new Error('Failed to initialize database');
    }

    console.log('✅ Database connected');
    console.log(`📊 Running on: ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}\n`);

    // ============================================
    // Initialize Redis
    // ============================================
    console.log('💾 Initializing Redis connection...');
    const redisClient = RedisClient.getInstance();
    await redisClient.initialize();

    console.log('✅ Redis connected\n');

    // ============================================
    // Create Express App
    // ============================================
    console.log('⚙️  Creating Express application...');
    const app = createApp();

    console.log('✅ Express app created\n');

    // ============================================
    // Start Server
    // ============================================
    const server = app.listen(PORT, () => {
      console.log('╔════════════════════════════════════════════════╗');
      console.log('║          FitKart Backend Server                ║');
      console.log('║                    Ready!                      ║');
      console.log('╚════════════════════════════════════════════════╝\n');
      console.log(`✨ API Server: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/v1/auth`);
      console.log(`👥 Users: http://localhost:${PORT}/api/v1/users`);
      console.log(`💰 Coins: http://localhost:${PORT}/api/v1/coins`);
      console.log(`🚶 Steps: http://localhost:${PORT}/api/v1/steps`);
      console.log(`📦 Orders: http://localhost:${PORT}/api/v1/orders`);
      console.log(`🏆 Achievements: http://localhost:${PORT}/api/v1/achievements`);
      console.log(`📊 Leaderboard: http://localhost:${PORT}/api/v1/leaderboard`);
      console.log(`🛒 Store: http://localhost:${PORT}/api/v1/store`);
      console.log(`⚙️  Admin: http://localhost:${PORT}/api/v1/admin\n`);
    });

    // ============================================
    // Graceful Shutdown
    // ============================================
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n📍 Received ${signal}, starting graceful shutdown...\n`);

      // Stop accepting new requests
      server.close(async () => {
        console.log('✅ HTTP server closed');

        // Close database connection
        try {
          await closeDatabase();
          console.log('✅ Database connection closed');
        } catch (error) {
          console.error('❌ Error closing database:', error);
        }

        // Close Redis connection
        try {
          await redisClient.close();
          console.log('✅ Redis connection closed');
        } catch (error) {
          console.error('❌ Error closing Redis:', error);
        }

        console.log('\n👋 Goodbye!\n');
        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        console.error('⚠️  Forceful shutdown after 30 seconds');
        process.exit(1);
      }, 30000);
    };

    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    console.error('❌ Fatal error during startup:', error);
    process.exit(1);
  }
}

// Start the server
main();
