import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private repo: Repository<User>
  ){};

  create(createUserDto: CreateUserDto) {
    return this.repo.save(this.repo.create(createUserDto));
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const user = await this.repo.findOneBy({id});
    if(!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto)
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.repo.remove(user);
    return {delete: true, id: id};
  }
}
