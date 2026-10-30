import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  TodoCategory,
  TodoPriority,
  TodoStatus,
} from '../entities/todo.entity.js';

export class CreateTodoDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  userId?: number | null;

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
