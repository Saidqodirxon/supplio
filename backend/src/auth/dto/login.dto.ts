import { IsNotEmpty, IsPhoneNumber, MinLength } from "class-validator";

export class LoginDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
