import { IsNotEmpty, IsString } from 'class-validator';

export class QueryAlertsDto {
  @IsNotEmpty({ message: 'candidateIds é obrigatório (lista separada por vírgula)' })
  @IsString()
  candidateIds!: string;

  @IsNotEmpty({ message: 'priorities é obrigatório (lista separada por vírgula, ex: p1,p3,p9)' })
  @IsString()
  priorities!: string;
}
