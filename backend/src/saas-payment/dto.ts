import { IsString, IsNumber, IsPositive, Matches, Length, IsOptional } from 'class-validator';

export class CreateCardDto {
  @IsString() @Length(16, 16) cardNumber: string;
  @IsString() @Matches(/^\d{4}$/) expireDate: string;
  @IsString() @Matches(/^\+?[0-9]{10,15}$/) phoneNumber: string;
  @IsString() @IsOptional() cardName?: string;
}

export class ConfirmCardDto {
  @IsString() cid: string;
  @IsString() @Length(4, 8) otp: string;
  @IsString() @IsOptional() cardName?: string;
}

export class SetDefaultCardDto {
  // no body, id from param
}

export class CreateClickPaymentDto {
  @IsString() planKey: string;
  @IsNumber() @IsPositive() amount: number;
}

export class PaylovPayDto {
  @IsString() savedCardId: string;
  @IsString() planKey: string;
  @IsNumber() @IsPositive() amount: number;
}
