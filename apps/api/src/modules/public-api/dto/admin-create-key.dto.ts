import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum, IsNumber, IsDateString } from 'class-validator';

export enum ApiKeyTier {
  FREE = 'FREE',
  PAID = 'PAID',
}

export class AdminCreateKeyDto {
  @IsEmail({}, { message: 'Formato de e-mail inválido' })
  @IsNotEmpty({ message: 'E-mail de contato é obrigatório' })
  contactEmail!: string;

  @IsEnum(ApiKeyTier, { message: 'Tier deve ser FREE ou PAID' })
  @IsOptional()
  tier?: ApiKeyTier;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsNumber()
  dailyLimit?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
