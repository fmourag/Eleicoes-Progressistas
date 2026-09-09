import { IsEnum, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export enum PledgeStatus {
  PROPOSTA = 'PROPOSTA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CUMPRIDA = 'CUMPRIDA',
  QUEBRADA = 'QUEBRADA',
}

export class UpdatePledgeDto {
  @IsNotEmpty({ message: 'O status da promessa é obrigatório' })
  @IsEnum(PledgeStatus, { message: 'Status deve ser PROPOSTA, EM_ANDAMENTO, CUMPRIDA ou QUEBRADA' })
  status!: PledgeStatus;

  @IsOptional()
  @IsUrl({}, { message: 'A URL de evidência deve ser válida' })
  evidenceUrl?: string;
}
