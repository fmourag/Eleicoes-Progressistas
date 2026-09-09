import { IsEnum, IsNotEmpty } from 'class-validator';
import { ElectionResult } from '@prisma/client';

export class UpdateCandidateResultDto {
  @IsNotEmpty({ message: 'O resultado eleitoral é obrigatório' })
  @IsEnum(ElectionResult, { message: 'Resultado deve ser ELEITO, NAO_ELEITO ou SUPLENTE' })
  electionResult!: ElectionResult;
}
