export declare class LoginDto {
    documento: string;
    senha: string;
}
export declare class RegisterDto {
    documento: string;
    senha: string;
    email?: string;
}
export declare class AuthResponseDto {
    token: string;
    cliente: {
        id: number;
        nome: string;
        email: string | null;
        documento: string;
        tipoPessoa: 'PF' | 'PJ';
    };
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
