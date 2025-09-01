import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from './user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column({ type: 'varchar' }) email!: string;

  @Column({ type: 'varchar' }) password!: string;

  @Column({ type: 'varchar' }) role!: UserRole;

  @Column({ type: 'varchar', nullable: true }) refreshTokenHash!: string | null;

  @Column({ type: 'timestamptz', nullable: true }) lastLoginAt!: Date | null;

  @CreateDateColumn() createdAt!: Date;

  @UpdateDateColumn() updatedAt!: Date;
  tokenVersion: any;
}
export { UserRole };
