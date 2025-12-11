import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'CPF/CNPJ é obrigatório' })
  documento: string;

  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  senha: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'CPF/CNPJ é obrigatório' })
  documento: string;

  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  senha: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsOptional()
  email?: string;
}

export class AuthResponseDto {
  token: string;
  cliente: {
    id: number;
    nome: string;
    email: string | null;
    documento: string;
    tipoPessoa: 'PF' | 'PJ';
  };
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
