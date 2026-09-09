import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  productSlug?: string;

  @IsNotEmpty()
  @IsString()
  buyerOrg!: string;

  @IsNotEmpty()
  @IsEmail()
  buyerEmail!: string;
}
