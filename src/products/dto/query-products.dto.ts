import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QueryProductsDto {
  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Filter by name (icontains)' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by category (exact match)' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Min price' })
  @Transform(({ value }: { value: string }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  priceMin?: number;

  @ApiPropertyOptional({ description: 'Max price' })
  @Transform(({ value }: { value: string }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  priceMax?: number;
}
