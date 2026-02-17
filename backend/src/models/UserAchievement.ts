// backend/src/models/UserAchievement.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('user_achievements')
@Index('idx_user_id', ['user_id'])
@Index('idx_achievement_id', ['achievement_id'])
@Index('idx_user_achievement', ['user_id', 'achievement_id'], { unique: true })
export class UserAchievement {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  achievement_id: string;

  @Column('varchar', { length: 255, nullable: true })
  achievement_name: string | null;

  @Column('integer', { default: 0 })
  reward_coins: number;

  @CreateDateColumn()
  unlocked_at: Date;
}
