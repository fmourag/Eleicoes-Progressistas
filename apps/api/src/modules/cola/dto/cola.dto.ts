import { IsString, IsOptional, IsArray, ValidateNested, MaxLength, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export class ColaCandidateItemDto {
  @IsString()
  @MaxLength(64)
  id: string;

  @IsString()
  @MaxLength(120)
  name: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  socialName?: string;

  @IsString()
  @MaxLength(120)
  @IsOptional()
  viceName?: string;

  @IsString()
  @MaxLength(64)
  cargo: string;

  @IsString()
  @MaxLength(64)
  party: string;

  @IsOptional()
  partyNumber?: number;

  @IsString()
  @MaxLength(10)
  @IsOptional()
  numeroUrna?: string;

  @IsString()
  @MaxLength(64)
  @IsOptional()
  tseId?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @MaxLength(10)
  @IsOptional()
  state?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  municipality?: string;

  @IsOptional()
  fichaLimpa?: boolean;
}

export class GenerateColaPdfDto {
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ColaCandidateItemDto)
  candidates: ColaCandidateItemDto[];

  @IsString()
  @MaxLength(10)
  @IsOptional()
  state?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  municipality?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  voterName?: string;

  @IsString()
  @MaxLength(128)
  @IsOptional()
  deviceHash?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  date?: string;
}
