import { IsString, IsOptional, MaxLength } from 'class-validator';

export class RecordAccessDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  eventType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  deviceType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referrer?: string;
}

export class RecordShareDto {
  @IsString()
  @MaxLength(30)
  channel!: string; // 'whatsapp' | 'email' | 'copy' | 'native'

  @IsOptional()
  @IsString()
  @MaxLength(20)
  deviceType?: string;
}
