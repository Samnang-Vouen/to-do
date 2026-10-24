import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  TodoCategory,
  TodoPriority,
  TodoStatus,
} from '../entities/todo.entity.js';

export class CreateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsEnum(TodoCategory)
  category?: TodoCategory;

  @IsOptional()
  @IsEnum(TodoPriority)
  priority?: TodoPriority;

  @IsOptional()
  @IsEnum(TodoStatus)
  status: TodoStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;
}
