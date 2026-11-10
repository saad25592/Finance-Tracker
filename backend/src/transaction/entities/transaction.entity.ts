import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity.js';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string; 

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number; 

  @Column()
  type: string;

  @Column({ type: 'date' })
  date: string; 

  @CreateDateColumn()
  createdAt: Date; 

  @Column({ nullable: true, default: 'Personal' })
  source: string;

  
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: User;
}