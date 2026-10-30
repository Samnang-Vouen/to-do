import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AccessTokenPayload } from '../auth/auth.types.js';
import { UserRole } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { Todo, TodoStatus } from './entities/todo.entity.js';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private repo: Repository<Todo>,
    private users: UsersService,
  ) {}

  async create(createTodoDto: CreateTodoDto) {
    await this.checkAssignee(createTodoDto.userId);
    const saved = await this.repo.save(this.repo.create(createTodoDto));
    return this.findOneOrFail(saved.id);
  }

  // Admins see every task; operators only see tasks assigned to them
  findAll(user: AccessTokenPayload) {
    return this.repo.find({
      where: user.role === UserRole.ADMIN ? {} : { userId: user.sub },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, user: AccessTokenPayload) {
    const todo = await this.findOneOrFail(id);
    // 404, not 403: don't reveal that other people's tasks exist
    if (user.role !== UserRole.ADMIN && todo.userId !== user.sub) {
      throw new NotFoundException(`Todo ${id} not found`);
    }
    return todo;
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    const todo = await this.findOneOrFail(id);
    await this.checkAssignee(updateTodoDto.userId);
    Object.assign(todo, updateTodoDto);
    await this.repo.save(todo);
    return this.findOneOrFail(id);
  }

  async updateStatus(id: number, status: TodoStatus, user: AccessTokenPayload) {
    const todo = await this.findOne(id, user); // also checks the operator owns it
    todo.status = status;
    await this.repo.save(todo);
    return this.findOneOrFail(id);
  }

  async remove(id: number) {
    const todo = await this.findOneOrFail(id);
    await this.repo.remove(todo);
    return { delete: true, id: id };
  }

  private async findOneOrFail(id: number) {
    const todo = await this.repo.findOne({ where: { id }, relations: { user: true } });
    if (!todo) throw new NotFoundException(`Todo ${id} not found`);
    return todo;
  }

  // Tasks can only be assigned to operators
  private async checkAssignee(userId: number | null | undefined) {
    if (userId == null) return; // unassigned, or not being changed
    const assignee = await this.users.findOne(userId).catch(() => null);
    if (assignee?.role !== UserRole.OPERATOR) {
      throw new BadRequestException(`User ${userId} is not an operator`);
    }
  }
}