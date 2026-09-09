import { IsEmail, IsString, Matches, Length } from 'class-validator';

export class SyncUserDto {
  @IsString()
  id!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'invalid CEP format' })
  cep!: string;

  @IsString()
  municipality!: string;

  @IsString()
  @Length(2, 2)
  state!: string;
}
