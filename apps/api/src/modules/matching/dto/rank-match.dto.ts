import {
  IsArray,
  IsString,
  IsIn,
  ValidateNested,
  ArrayMaxSize,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PILLARS } from '@np/shared';

export const VALID_PILLARS = [
  'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7',
  'p8', 'p9', 'p10', 'p11', 'p12', 'p13'
] as const;

export class LocationDto {
  @IsOptional()
  @IsString()
  uf?: string;

  @IsOptional()
  @IsString()
  ibge_code?: string;
}

export class RankMatchDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  @IsIn(VALID_PILLARS as unknown as string[], { each: true })
  priority_pillars?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsBoolean()
  includePending?: boolean;

  static validate(dto: RankMatchDto): boolean {
    if (!dto) return true;
    if (dto.priority_pillars) {
      if (!Array.isArray(dto.priority_pillars)) return false;
      if (dto.priority_pillars.length > 3) return false;
      for (const p of dto.priority_pillars) {
        if (!(VALID_PILLARS as readonly string[]).includes(p)) return false;
      }
    }
    return true;
  }
}
