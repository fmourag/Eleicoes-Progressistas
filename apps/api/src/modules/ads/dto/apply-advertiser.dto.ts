import { IsString, IsNotEmpty, IsEmail, IsOptional, MaxLength, ArrayMinSize, ArrayMaxSize, IsArray } from 'class-validator';
import { IsCnpjValid } from '../validators/is-cnpj-valid.validator';

export class ApplyAdvertiserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsCnpjValid()
  cnpj: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsString({ each: true })
  pillarAlignment: string[];

  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  applicationNote?: string;

  @IsOptional()
  @IsString()
  website?: string; // Campo honeypot anti-bot
}
