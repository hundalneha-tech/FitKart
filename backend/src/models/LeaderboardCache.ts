// backend/src/models/LeaderboardCache.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('leaderboard_cache')
@Index('idx_period_rank', ['period', 'rank'])
@Index('idx_user_id_period', ['user_id', 'period'], { unique: true })
@Index('idx_updated_at', ['updated_at'])
export class LeaderboardCache {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('varchar', { length: 50 })
  period: 'weekly' | 'monthly' | 'all_time';

  @Column('integer')
  rank: number;

  @Column('bigint')
  total_steps: number;

  @Column('numeric', { precision: 10, scale: 2 })
  total_distance: number;

  @Column('bigint')
  coins_earned: number;

  @Column('varchar', { length: 255, nullable: true })
  user_name: string | null;

  @Column('varchar', { length: 500, nullable: true })
  user_picture_url: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
