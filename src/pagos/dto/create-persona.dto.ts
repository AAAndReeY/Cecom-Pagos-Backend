import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreatePersonaDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString({ message: 'El DNI debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El DNI es obligatorio' })
  @Length(8, 8, { message: 'El DNI debe tener exactamente 8 caracteres' })
  dni: string;

  @IsString({ message: 'El RUC debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El RUC es obligatorio' })
  @Length(11, 11, { message: 'El RUC debe tener exactamente 11 caracteres' })
  ruc: string;

  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  direccion: string;

  @IsString({ message: 'El banco debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El banco es obligatorio' })
  banco: string;

  @IsString({ message: 'El CCI debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El CCI es obligatorio' })
  cci: string;

  @IsString({ message: 'El colegio debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El colegio es obligatorio' })
  colegio: string;

  @IsString({ message: 'El año debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El año es obligatorio' })
  anio: string;

}
