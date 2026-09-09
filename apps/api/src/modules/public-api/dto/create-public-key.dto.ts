import { IsEmail, IsNotEmpty, MaxLength, IsOptional, IsString } from 'class-validator';

export class CreatePublicKeyDto {
  @IsEmail({}, { message: 'Formato de e-mail inválido' })
  @IsNotEmpty({ message: 'E-mail de contato é obrigatório para gestão técnica da chave' })
  contactEmail!: string;

  @IsNotEmpty({ message: 'A declaração de propósito é obrigatória' })
  @MaxLength(300, { message: 'O propósito deve ter no máximo 300 caracteres' })
  @IsString()
  purpose!: string;

  @IsOptional()
  @IsString()
  website?: string; // Honeypot anti-bot
}
