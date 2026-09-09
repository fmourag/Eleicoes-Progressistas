import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmOrderDto {
  @IsNotEmpty()
  @IsString()
  paymentRef!: string;
}
