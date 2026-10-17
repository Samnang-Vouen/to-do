import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity.js';

@Injectable()
export class TodosService {

  constructor(
    @InjectRepository(Todo)
    private repo: Repository<Todo>,
  ) {}

  create(createTodoDto: CreateTodoDto) {
    return this.repo.save(this.repo.create(createTodoDto));
  }

  findAll() {
    return this.repo.find({order: {createdAt: 'DESC'}});
  }

  async findOne(id: number) {
    const todo = await this.repo.findOneBy({id});
    if (!todo) throw new NotFoundException(`Todo ${id} not found`);
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    const todo = await this.findOne(id);
    Object.assign(todo, updateTodoDto);
    return this.repo.save(todo);
  }

  async remove(id: number) {
    const todo = await this.findOne(id);
    await this.repo.remove(todo);
    return {delete: true, id: id};
  }
}
