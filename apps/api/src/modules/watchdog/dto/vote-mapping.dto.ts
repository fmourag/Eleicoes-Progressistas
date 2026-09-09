import { IsNotEmpty, IsString, IsArray, ArrayMinSize } from 'class-validator';

export class VoteMappingDto {
  @IsNotEmpty({ message: 'O identificador externo da votação é obrigatório' })
  @IsString()
  voteExternalId!: string;

  @IsArray({ message: 'Pilares deve ser uma lista de códigos (ex: ["p3", "p9"])' })
  @ArrayMinSize(1, { message: 'Ao menos um pilar deve ser associado' })
  pillars!: string[];
}
