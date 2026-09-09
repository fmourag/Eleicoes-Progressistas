import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class QueryVotesDto {
  @IsNotEmpty({ message: 'candidateId é obrigatório' })
  @IsString()
  candidateId!: string;

  @IsOptional()
  @IsDateString({}, { message: 'since deve ser uma data ISO válida' })
  since?: string;
}
