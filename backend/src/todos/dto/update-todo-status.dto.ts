import { IsEnum } from 'class-validator';
import { TodoStatus } from '../entities/todo.entity.js';

export class UpdateTodoStatusDto {
    @IsEnum(TodoStatus)
    status: TodoStatus;
}
