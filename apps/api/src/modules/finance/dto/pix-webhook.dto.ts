import { IsString, IsNumber, IsOptional } from 'class-validator';

export class PixWebhookDto {
  @IsString()
  provider: string; // "MERCADO_PAGO" | "PAGSEGURO" | "MANUAL"

  @IsString()
  eventId: string; // Unique transaction/event identifier

  @IsNumber()
  amountCents: number; // e.g. 1500 = R$ 15,00

  @IsOptional()
  @IsString()
  secret?: string;
}
