import { IsString, IsOptional, Length } from 'class-validator';

export class UpdatePersonaDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsOptional()
  nombre?: string;

  @IsString({ message: 'El DNI debe ser una cadena de texto' })
  @IsOptional()
  @Length(8, 8, { message: 'El DNI debe tener exactamente 8 caracteres' })
  dni?: string;

  @IsString({ message: 'El RUC debe ser una cadena de texto' })
  @IsOptional()
  @Length(11, 11, { message: 'El RUC debe tener exactamente 11 caracteres' })
  ruc?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  banco?: string;

  @IsString()
  @IsOptional()
  cci?: string;

  @IsString()
  @IsOptional()
  colegio?: string;

  @IsString()
  @IsOptional()
  anio?: string;

}
