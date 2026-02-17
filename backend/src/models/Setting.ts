// backend/src/models/Setting.ts

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('settings')
@Index('idx_key', ['key'], { unique: true })
export class Setting {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, unique: true })
  key: string;

  @Column('varchar', { length: 255 })
  label: string;

  @Column('text')
  value: string;

  @Column('varchar', { length: 50 })
  type: 'string' | 'integer' | 'float' | 'boolean' | 'json';

  @Column('text', { nullable: true })
  description: string | null;

  @Column('boolean', { default: false })
  is_editable: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
