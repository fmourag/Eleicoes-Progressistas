import { IsString, IsArray, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateAdvertiserDto {
  @IsString()
  name: string;

  @IsString()
  cnpj: string;

  @IsString()
  category: string;

  @IsArray()
  pillarAlignment: string[];

  @IsOptional()
  startDate?: string | Date;

  @IsOptional()
  endDate?: string | Date;

  @IsOptional()
  @IsNumber()
  contractValue?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
