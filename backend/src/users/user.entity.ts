import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  // ইম্পোর্টের ঝামেলা এড়াতে সরাসরি 'Transaction' স্ট্রিং ব্যবহার করা হলো
  @OneToMany('Transaction', 'user')
  transactions: any[];
}