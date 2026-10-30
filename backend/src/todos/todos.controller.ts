import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import type { AccessTokenPayload } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { UserRole } from '../users/entities/user.entity.js';
import { CreateTodoDto } from './dto/create-todo.dto.js';
import { UpdateTodoStatusDto } from './dto/update-todo-status.dto.js';
import { UpdateTodoDto } from './dto/update-todo.dto.js';
import { TodosService } from './todos.service.js';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Roles([UserRole.ADMIN])
  @Post()
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(createTodoDto);
  }

  @Get()
  findAll(@CurrentUser() user: AccessTokenPayload) {
    return this.todosService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AccessTokenPayload) {
    return this.todosService.findOne(id, user);
  }

  // Full edit, including reassigning: admin only
  @Roles([UserRole.ADMIN])
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(id, updateTodoDto);
  }

  // Status only: operators (their own tasks) and admins
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoStatusDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.todosService.updateStatus(id, dto.status, user);
  }

  @Roles([UserRole.ADMIN])
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.todosService.remove(id);
  }
}