// backend/src/models/User.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

@Entity('users')
@Index('idx_email', ['email'], { unique: true })
@Index('idx_created_at', ['created_at'])
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar', { length: 255, unique: true })
  email: string;

  @Column('varchar', { length: 255, nullable: true })
  password_hash: string | null;

  @Column('varchar', { length: 255 })
  full_name: string;

  @Column('varchar', { length: 20, nullable: true })
  phone: string | null;

  @Column('varchar', { length: 5, default: '+1' })
  country_code: string;

  @Column('text', { nullable: true })
  bio: string | null;

  @Column('varchar', { length: 500, nullable: true })
  profile_picture_url: string | null;

  @Column('date', { nullable: true })
  date_of_birth: Date | null;

  @Column('varchar', { length: 20, default: 'user' })
  role: 'user' | 'moderator' | 'admin';

  @Column('boolean', { default: false })
  email_verified: boolean;

  @Column('timestamp', { nullable: true })
  email_verified_at: Date | null;

  @Column('boolean', { default: false })
  is_blocked: boolean;

  @Column('jsonb', { nullable: true, default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date | null;
}
