// backend/src/models/RefreshToken.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('refresh_tokens')
@Index('idx_user_id', ['user_id'])
@Index('idx_expires_at', ['expires_at'])
export class RefreshToken {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('text')
  token: string;

  @Column('varchar', { length: 45, nullable: true })
  ip_address: string | null;

  @Column('varchar', { length: 500, nullable: true })
  user_agent: string | null;

  @Column('timestamp')
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
