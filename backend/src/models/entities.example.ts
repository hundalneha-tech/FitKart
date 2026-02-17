-- Example TypeORM Entity Models for FitKart
-- These would be created as separate files in src/models/

-- User Entity
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';
import { StepRecord } from './StepRecord';
import { CoinTransaction } from './CoinTransaction';
import { Order } from './Order';
import { UserAchievement } from './UserAchievement';

@Entity('users')
@Index('idx_users_email', ['email'])
@Index('idx_users_is_active', ['isActive'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, select: false })
  passwordHash: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ type: 'text', nullable: true })
  profilePictureUrl: string;

  @Column({ default: 'email' })
  authProvider: 'email' | 'google' | 'apple';

  @Column({ nullable: true })
  providerId: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ type: 'bigint', default: 0 })
  totalSteps: number;

  @Column({ type: 'bigint', default: 0 })
  totalCoins: number;

  @Column({ type: 'bigint', default: 0 })
  lifetimeCoinsEarned: number;

  @Column({ type: 'bigint', default: 0 })
  lifetimeCoinsSpent: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // Relations
  @OneToMany(() => StepRecord, (record) => record.user)
  stepRecords: StepRecord[];

  @OneToMany(() => CoinTransaction, (transaction) => transaction.user)
  coinTransactions: CoinTransaction[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => UserAchievement, (achievement) => achievement.user)
  achievements: UserAchievement[];
}

-- Step Record Entity
@Entity('step_records')
export class StepRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'bigint' })
  steps: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  calories: number;

  @Column({ nullable: true })
  heartPoints: number;

  @Column()
  source: 'google_fit' | 'health_kit' | 'manual';

  @Column({ type: 'date' })
  recordedDate: Date;

  @Column({ nullable: true })
  syncToken: string;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.stepRecords)
  user: User;
}

-- Coin Transaction Entity
@Entity('coin_transactions')
export class CoinTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'bigint' })
  amount: number;

  @Column()
  transactionType: 'earned' | 'spent' | 'refund' | 'bonus' | 'penalty';

  @Column({ nullable: true })
  referenceType: string;

  @Column({ nullable: true })
  referenceId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'bigint' })
  balanceBefore: number;

  @Column({ type: 'bigint' })
  balanceAfter: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.coinTransactions)
  user: User;
}

-- Order Entity
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ unique: true })
  orderCode: string;

  @Column({ type: 'bigint' })
  totalCoins: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress: any;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  shippedAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date;

  @Column({ nullable: true })
  cancelledAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];
}

-- Achievement Entity
@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  iconUrl: string;

  @Column({ nullable: true })
  badgeColor: string;

  @Column({ type: 'jsonb' })
  unlockCriteria: Record<string, any>;

  @Column({ type: 'bigint', default: 0 })
  rewardCoins: number;

  @Column({ nullable: true })
  displayOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserAchievement, (ua) => ua.achievement)
  userAchievements: UserAchievement[];
}

-- User Achievement Entity
@Entity('user_achievements')
export class UserAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  achievementId: string;

  @CreateDateColumn()
  unlockedAt: Date;

  @ManyToOne(() => User, (user) => user.achievements)
  user: User;

  @ManyToOne(() => Achievement, (achievement) => achievement.userAchievements)
  achievement: Achievement;
}
