import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (await this.repo.existsBy({ email: createUserDto.email })) {
      throw new ConflictException('Email already registered');
    }
    const user = this.repo.create({
      ...createUserDto,
      password: await argon2.hash(createUserDto.password),
    });
    const saved = await this.repo.save(user);
    return this.findOne(saved.id); // re-read so the hash isn't returned
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  findByEmailWithPassword(email: string) {
    return this.repo.findOne({
      where: { email },
      select: { id: true, email: true, password: true },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (updateUserDto.password) {
      updateUserDto.password = await argon2.hash(updateUserDto.password);
    }
    Object.assign(user, updateUserDto);
    await this.repo.save(user);
    return this.findOne(id);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.repo.remove(user);
    return { delete: true, id: id };
  }
}
