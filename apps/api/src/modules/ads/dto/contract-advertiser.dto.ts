import { IsNumber, IsNotEmpty, IsDateString } from 'class-validator';

export class ContractAdvertiserDto {
  @IsNumber()
  @IsNotEmpty()
  contractValue: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
