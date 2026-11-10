import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(name: string, email: string, passwordHash: string): Promise<User> {
    const newUser = this.usersRepository.create({ 
      name, 
      email, 
      password: passwordHash 
    });
    return this.usersRepository.save(newUser);
  }
}