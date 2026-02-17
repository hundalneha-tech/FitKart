// backend/src/config/database.ts

import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import {
  User,
  RefreshToken,
  Wallet,
  CoinTransaction,
  StepRecord,
  StepValidation,
  Order,
  OrderItem,
  RewardProduct,
  Achievement,
  UserAchievement,
  LeaderboardCache,
  AdminLog,
  Setting,
} from '../models';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'fitkart',
  entities: [
    User,
    RefreshToken,
    Wallet,
    CoinTransaction,
    StepRecord,
    StepValidation,
    Order,
    OrderItem,
    RewardProduct,
    Achievement,
    UserAchievement,
    LeaderboardCache,
    AdminLog,
    Setting,
  ],
  synchronize: false, // Use migrations instead
  logging: !isProduction, // Log SQL in development
  logger: 'advanced-console',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  maxQueryExecutionTime: 1000, // Log queries taking more than 1 second
  poolErrorHandler: (err) => {
    console.error('Database pool error:', err);
  },
  extra: {
    // Connection pool settings
    max: 20, // Maximum number of connections
    min: 5, // Minimum number of connections
    idleTimeoutMillis: 30000, // Idle timeout
    connectionTimeoutMillis: 10000, // Connection timeout
  },
};

export const AppDataSource = new DataSource(dataSourceOptions);

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<void> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing database:', error);
    throw error;
  }
}

/**
 * Run database migrations
 */
export async function runMigrations(): Promise<void> {
  try {
    if (!AppDataSource.isInitialized) {
      await initializeDatabase();
    }

    console.log('🔄 Running migrations...');
    await AppDataSource.runMigrations();
    console.log('✅ Migrations completed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Revert last migration
 */
export async function revertMigration(): Promise<void> {
  try {
    if (!AppDataSource.isInitialized) {
      await initializeDatabase();
    }

    console.log('🔄 Reverting migration...');
    await AppDataSource.undoLastMigration();
    console.log('✅ Migration reverted');
  } catch (error) {
    console.error('❌ Revert failed:', error);
    throw error;
  }
}

export default AppDataSource;
