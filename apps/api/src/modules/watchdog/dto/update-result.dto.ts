import { IsEnum, IsNotEmpty } from 'class-validator';

export enum ElectionResult {
  ELEITO = 'ELEITO',
  NAO_ELEITO = 'NAO_ELEITO',
  SUPLENTE = 'SUPLENTE',
}

export class UpdateCandidateResultDto {
  @IsNotEmpty({ message: 'O resultado eleitoral é obrigatório' })
  @IsEnum(ElectionResult, { message: 'Resultado deve ser ELEITO, NAO_ELEITO ou SUPLENTE' })
  electionResult!: ElectionResult;
}
