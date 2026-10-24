import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

export enum TodoStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done',
}

export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum TodoCategory {
  WORK = 'Work',
  PERSONAL = 'Personal',
  STUDY = 'Study',
  HEALTH = 'Health',
  OTHER = 'Other',
}

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: TodoCategory, default: TodoCategory.WORK })
  category: TodoCategory;

  @Column({ type: 'enum', enum: TodoPriority, default: TodoPriority.MEDIUM })
  priority: TodoPriority;

  @Column({ type: 'enum', enum: TodoStatus, default: TodoStatus.TODO })
  status: TodoStatus;

  @Column({ type: 'date', nullable: true })
  dueDate: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: Relation<User>; // Relation<> avoids a circular-import crash under ESM
}
