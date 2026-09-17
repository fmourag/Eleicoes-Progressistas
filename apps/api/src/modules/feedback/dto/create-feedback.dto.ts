import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsOptional()
  @MaxLength(120, { message: 'Nome do testador não pode exceder 120 caracteres.' })
  testerName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120, { message: 'Nome não pode exceder 120 caracteres.' })
  nome?: string;

  @IsString()
  @IsOptional()
  @MaxLength(160, { message: 'E-mail não pode exceder 160 caracteres.' })
  email?: string;

  @IsString()
  @IsNotEmpty({ message: 'Informações do dispositivo são obrigatórias.' })
  @MaxLength(150, { message: 'Identificação do dispositivo não pode exceder 150 caracteres.' })
  device: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Versão do Android não pode exceder 50 caracteres.' })
  androidVersion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Versão do aplicativo não pode exceder 50 caracteres.' })
  appVersion?: string;

  @IsInt()
  @Min(0)
  @Max(10)
  nps: number;

  @IsString()
  @IsNotEmpty({ message: 'Tipo de problema ou avaliação é obrigatório.' })
  @MaxLength(100, { message: 'Categoria do problema não pode exceder 100 caracteres.' })
  problema: string;

  @IsString()
  @IsOptional()
  @MaxLength(3000, { message: 'Descrição do problema não pode exceder 3000 caracteres.' })
  descricao?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Descrição da captura de tela não pode exceder 1000 caracteres.' })
  screenshotDesc?: string;
}
