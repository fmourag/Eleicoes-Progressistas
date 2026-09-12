import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, Matches } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsOptional()
  testerName?: string;

  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty({ message: 'Informações do dispositivo são obrigatórias.' })
  device: string;

  @IsString()
  @IsOptional()
  androidVersion?: string;

  @IsString()
  @IsOptional()
  appVersion?: string;

  @IsInt()
  @Min(0)
  @Max(10)
  nps: number;

  @IsString()
  @IsNotEmpty({ message: 'Tipo de problema ou avaliação é obrigatório.' })
  problema: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsString()
  @IsOptional()
  screenshotDesc?: string;
}
