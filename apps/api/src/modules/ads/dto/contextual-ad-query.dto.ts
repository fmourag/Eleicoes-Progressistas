import { IsOptional, IsString } from 'class-validator';

export class ContextualAdQueryDto {
  @IsString()
  screen: string;

  @IsOptional()
  @IsString()
  pillar?: string;

  @IsOptional()
  @IsString()
  pilar?: string;

  @IsOptional()
  @IsString()
  date?: string;
}

export interface TransparencyReport {
  totalAdvertisers: number;
  totalRevenue: number;
  advertisers: Array<{
    name: string;
    cnpj: string;
    category: string;
    pillars: string[];
    contractValue: number | null;
    activeAds: number;
  }>;
}
