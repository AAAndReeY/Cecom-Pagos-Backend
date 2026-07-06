import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBancoDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;
}
