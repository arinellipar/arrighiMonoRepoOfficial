import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ClienteCredencial } from '../../entities/cliente-credencial.entity';
import { Cliente, PessoaFisica, PessoaJuridica } from '../../entities/cliente.entity';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';
export declare class AuthService {
    private credencialRepository;
    private clienteRepository;
    private pessoaFisicaRepository;
    private pessoaJuridicaRepository;
    private jwtService;
    private readonly logger;
    constructor(credencialRepository: Repository<ClienteCredencial>, clienteRepository: Repository<Cliente>, pessoaFisicaRepository: Repository<PessoaFisica>, pessoaJuridicaRepository: Repository<PessoaJuridica>, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    validateUser(payload: any): Promise<any>;
}
