import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  // টোকেন থেকে ইউজারের আইডি (userId) বের করার হেল্পার ফাংশন
  private getUserIdFromToken(req: any): number {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) throw new UnauthorizedException('No token provided');
      
      const token = authHeader.split(' ')[1];
      const payloadBase64 = token.split('.')[1];
      const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
      const decoded = JSON.parse(decodedJson);
      
      // সাধারণত টোকেনের পেলোডে id, userId বা sub হিসেবে ইউজারের আইডি থাকে
      return decoded.id || decoded.userId || decoded.sub;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async create(createTransactionDto: CreateTransactionDto, req: any) {
    const userId = this.getUserIdFromToken(req); // টোকেন থেকে আইডি নেওয়া হলো
    
    const newTransaction = this.transactionRepository.create({
      ...createTransactionDto,
      userId: userId, // ইউজারের আইডি ট্রানজেকশনের সাথে যুক্ত করা হলো
    });
    return await this.transactionRepository.save(newTransaction);
  }

  async findAll(req: any) {
    const userId = this.getUserIdFromToken(req);
    // শুধুমাত্র বর্তমান লগিন করা ইউজারের ডেটাগুলোই রিটার্ন করা হবে
    return await this.transactionRepository.find({ where: { userId } });
  }

  async findOne(id: number) {
    return await this.transactionRepository.findOne({ where: { id } });
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    await this.transactionRepository.update(id, updateTransactionDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return await this.transactionRepository.delete(id);
  }
}