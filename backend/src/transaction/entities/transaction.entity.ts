import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

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
}