import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewAdvertiserDto {
  @IsIn(['APROVADO', 'RECUSADO'])
  decision: 'APROVADO' | 'RECUSADO';

  @IsOptional()
  @IsString()
  note?: string;
}
