import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { UserRole } from '../enums/enum'

export class CreateUserDto {

   @IsString()
   @IsNotEmpty()
   firstName: string;

   @IsString()
   @IsNotEmpty()
   lastName: string;

   
   @IsString()
   @IsNotEmpty()
   @IsEmail()
   email: string;

   @IsString()
   @IsNotEmpty()
   @MinLength(8)
   password: string;
        
    @IsString()
  role?: string;
   /// optional thats the meaning of the "?"can be User or Admin
}
