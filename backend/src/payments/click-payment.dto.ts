import {
  IsString, IsNumber, IsPositive, IsUrl,
  IsOptional, IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── 1. URL Integration ───────────────────────────────────────────────────────

export class ClickUrlDto {
  @IsString() @IsNotEmpty()
  dealerId: string;

  @IsNumber() @IsPositive()
  @Type(() => Number)
  amount: number;

  @IsString() @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  returnUrl?: string;
}

// ─── 2. Shop API (Prepare / Complete) ────────────────────────────────────────
// Click sends this. All fields arrive as strings (form-encoded or JSON).

export class ClickShopCallbackDto {
  @IsNotEmpty() click_trans_id: string | number;
  @IsNotEmpty() service_id: string | number;
  @IsNotEmpty() click_paydoc_id: string | number;
  @IsNotEmpty() merchant_trans_id: string;   // our ClickOrder.id
  @IsOptional() merchant_prepare_id?: string | number;
  @IsNotEmpty() amount: string | number;
  @IsNotEmpty() action: string | number;     // 0 = prepare, 1 = complete
  @IsOptional() error?: string | number;
  @IsOptional() error_note?: string;
  @IsNotEmpty() sign_time: string;
  @IsNotEmpty() sign_string: string;
}

// ─── 3. Service / Billing API ─────────────────────────────────────────────────
// Click sends this when user initiates payment from Click App.

export class ClickServiceCheckDto {
  @IsNotEmpty() click_trans_id: string | number;
  @IsNotEmpty() service_id: string | number;
  @IsNotEmpty() user_id: string;      // dealer.id we registered with Click
  @IsNotEmpty() amount: string | number;
  @IsNotEmpty() action: string | number;
  @IsNotEmpty() sign_time: string;
  @IsNotEmpty() sign_string: string;
}

export class ClickServicePayDto {
  @IsNotEmpty() click_trans_id: string | number;
  @IsNotEmpty() service_id: string | number;
  @IsNotEmpty() merchant_trans_id: string;
  @IsNotEmpty() merchant_prepare_id: string | number;
  @IsNotEmpty() user_id: string;
  @IsNotEmpty() amount: string | number;
  @IsNotEmpty() action: string | number;
  @IsOptional() error?: string | number;
  @IsOptional() error_note?: string;
  @IsNotEmpty() sign_time: string;
  @IsNotEmpty() sign_string: string;
}
