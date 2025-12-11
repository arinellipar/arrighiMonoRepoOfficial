import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ClienteCredencial } from '../../entities/cliente-credencial.entity';
import {
  Cliente,
  PessoaFisica,
  PessoaJuridica,
} from '../../entities/cliente.entity';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(ClienteCredencial)
    private credencialRepository: Repository<ClienteCredencial>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(PessoaFisica)
    private pessoaFisicaRepository: Repository<PessoaFisica>,
    @InjectRepository(PessoaJuridica)
    private pessoaJuridicaRepository: Repository<PessoaJuridica>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { documento, senha } = loginDto;
    const documentoLimpo = documento.replace(/\D/g, '');

    this.logger.log(`Tentativa de login com documento: ${documentoLimpo.substring(0, 3)}***`);

    try {
      // Buscar cliente pelo documento (CPF ou CNPJ)
      let cliente: Cliente | null = null;
      let nome = 'Cliente';
      let email: string | null = null;
      let tipoPessoa: 'PF' | 'PJ' = 'PF';

      // Tentar buscar por CPF
      this.logger.log('Buscando por CPF...');
      const pf = await this.pessoaFisicaRepository.findOne({
        where: { CPF: documentoLimpo },
      });

      if (pf) {
        this.logger.log(`Pessoa Física encontrada: ${pf.Nome}`);
        nome = pf.Nome;
        tipoPessoa = 'PF';

        // Buscar TODOS os clientes com este PessoaFisicaId
        const clientes = await this.clienteRepository.find({
          where: { PessoaFisicaId: pf.Id },
        });

        // Encontrar qual cliente tem credencial cadastrada
        for (const c of clientes) {
          const cred = await this.credencialRepository.findOne({
            where: { ClienteId: c.Id, Ativo: true },
          });
          if (cred) {
            cliente = c;
            break;
          }
        }

        // Se nenhum tem credencial, pegar o primeiro para a mensagem de erro
        if (!cliente && clientes.length > 0) {
          cliente = clientes[0];
        }
      }

      // Se não encontrou por CPF, tentar por CNPJ
      if (!cliente) {
        this.logger.log('Buscando por CNPJ...');
        const pj = await this.pessoaJuridicaRepository.findOne({
          where: { CNPJ: documentoLimpo },
        });
        if (pj) {
          this.logger.log(`Pessoa Jurídica encontrada: ${pj.RazaoSocial}`);
          nome = pj.RazaoSocial;
          tipoPessoa = 'PJ';

          // Buscar TODOS os clientes com este PessoaJuridicaId
          const clientes = await this.clienteRepository.find({
            where: { PessoaJuridicaId: pj.Id },
          });

          // Encontrar qual cliente tem credencial cadastrada
          for (const c of clientes) {
            const cred = await this.credencialRepository.findOne({
              where: { ClienteId: c.Id, Ativo: true },
            });
            if (cred) {
              cliente = c;
              break;
            }
          }

          // Se nenhum tem credencial, pegar o primeiro para a mensagem de erro
          if (!cliente && clientes.length > 0) {
            cliente = clientes[0];
          }
        }
      }

      if (!cliente) {
        this.logger.warn('Cliente não encontrado com o documento informado');
        throw new UnauthorizedException('CPF/CNPJ não encontrado no sistema');
      }

      this.logger.log(`Cliente encontrado: ID ${cliente.Id}`);

      // Buscar credencial do cliente
      const credencial = await this.credencialRepository.findOne({
        where: { ClienteId: cliente.Id, Ativo: true },
      });

      if (!credencial) {
        this.logger.warn(`Cliente ${cliente.Id} não possui credencial cadastrada`);
        throw new UnauthorizedException(
          'Você ainda não possui uma conta no portal. Clique em "Criar conta" para se cadastrar.',
        );
      }

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, credencial.SenhaHash);
      if (!senhaValida) {
        this.logger.warn('Senha inválida');
        throw new UnauthorizedException('CPF/CNPJ ou senha inválidos');
      }

      email = credencial.Email;

      // Atualizar último acesso
      credencial.UltimoAcesso = new Date();
      await this.credencialRepository.save(credencial);

      // Gerar token JWT
      const payload = {
        sub: credencial.Id,
        clienteId: cliente.Id,
        documento: documentoLimpo,
      };
      const token = this.jwtService.sign(payload);

      this.logger.log(`Login bem-sucedido para cliente ${cliente.Id}`);

      return {
        token,
        cliente: {
          id: cliente.Id,
          nome,
          email,
          documento: documentoLimpo,
          tipoPessoa,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Erro no login:', error);
      throw new InternalServerErrorException('Erro interno ao processar login. Verifique se a tabela ClienteCredenciais existe no banco de dados.');
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, senha, documento } = registerDto;
    const documentoLimpo = documento.replace(/\D/g, '');

    this.logger.log(`Tentativa de registro com documento: ${documentoLimpo.substring(0, 3)}***`);

    try {
      // Buscar cliente pelo documento (CPF ou CNPJ)
      let cliente: Cliente | null = null;
      let nome = 'Cliente';
      let emailCliente: string | null = null;
      let clientesComMesmoDocumento: Cliente[] = [];
      let pf: any = null;

      // Tentar buscar por CPF
      pf = await this.pessoaFisicaRepository.findOne({
        where: { CPF: documentoLimpo },
      });
      if (pf) {
        // Buscar TODOS os clientes vinculados a esta PessoaFisica
        clientesComMesmoDocumento = await this.clienteRepository.find({
          where: { PessoaFisicaId: pf.Id },
        });
        nome = pf.Nome;
        emailCliente = pf.EmailEmpresarial || pf.EmailPessoal || null;
      }

      // Se não encontrou por CPF, tentar por CNPJ
      if (clientesComMesmoDocumento.length === 0) {
        const pj = await this.pessoaJuridicaRepository.findOne({
          where: { CNPJ: documentoLimpo },
        });
        if (pj) {
          clientesComMesmoDocumento = await this.clienteRepository.find({
            where: { PessoaJuridicaId: pj.Id },
          });
          nome = pj.RazaoSocial;
          emailCliente = pj.Email || null;
        }
      }

      if (clientesComMesmoDocumento.length === 0) {
        throw new BadRequestException(
          'CPF/CNPJ não encontrado no sistema. Você precisa ser um cliente cadastrado para criar uma conta.',
        );
      }

      // Verificar se algum desses clientes já tem credencial
      for (const c of clientesComMesmoDocumento) {
        const credencialExistente = await this.credencialRepository.findOne({
          where: { ClienteId: c.Id },
        });
        if (credencialExistente) {
          throw new BadRequestException(
            'Este CPF/CNPJ já possui uma conta cadastrada. Use a opção de login.',
          );
        }
      }

      // Escolher o melhor cliente usando SQL direto para garantir precisão
      // Prioridade: 1) tem boletos, 2) tem contratos ativos, 3) maior ID
      const clienteIds = clientesComMesmoDocumento.map(c => c.Id).join(',');

      const melhorClienteQuery = await this.credencialRepository.manager.query(`
        SELECT TOP 1 c.Id,
               (SELECT COUNT(*) FROM Boletos b INNER JOIN Contratos ct ON b.ContratoId = ct.Id WHERE ct.ClienteId = c.Id AND b.Ativo = 1) as QtdBoletos,
               (SELECT COUNT(*) FROM Contratos WHERE ClienteId = c.Id AND Ativo = 1) as QtdContratos
        FROM Clientes c
        WHERE c.Id IN (${clienteIds})
        ORDER BY
          (SELECT COUNT(*) FROM Boletos b INNER JOIN Contratos ct ON b.ContratoId = ct.Id WHERE ct.ClienteId = c.Id AND b.Ativo = 1) DESC,
          (SELECT COUNT(*) FROM Contratos WHERE ClienteId = c.Id AND Ativo = 1) DESC,
          c.Id DESC
      `);

      if (melhorClienteQuery.length > 0) {
        const melhorClienteId = melhorClienteQuery[0].Id;
        cliente = clientesComMesmoDocumento.find(c => c.Id === melhorClienteId) || clientesComMesmoDocumento[0];
        this.logger.log(`Múltiplos clientes encontrados. Selecionado cliente ${cliente.Id} (${melhorClienteQuery[0].QtdBoletos} boletos, ${melhorClienteQuery[0].QtdContratos} contratos ativos).`);
      } else {
        cliente = clientesComMesmoDocumento[0];
      }

      // Usar email fornecido ou email do cadastro do cliente
      const emailFinal = email || emailCliente || `${documentoLimpo}@portal.arrighi.com.br`;

      // Verificar se email já existe (apenas se foi fornecido um email)
      if (email) {
        const emailExistente = await this.credencialRepository.findOne({
          where: { Email: email },
        });
        if (emailExistente) {
          throw new BadRequestException('Email já cadastrado');
        }
      }

      // Criar hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);

      // Criar credencial
      const novaCredencial = this.credencialRepository.create({
        ClienteId: cliente.Id,
        Email: emailFinal,
        SenhaHash: senhaHash,
        Ativo: true,
        EmailVerificado: false,
      });
      await this.credencialRepository.save(novaCredencial);

      this.logger.log(`Conta criada com sucesso para cliente ${cliente.Id}`);

      // Gerar token JWT
      const payload = {
        sub: novaCredencial.Id,
        clienteId: cliente.Id,
        documento: documentoLimpo,
      };
      const token = this.jwtService.sign(payload);

      return {
        token,
        cliente: {
          id: cliente.Id,
          nome,
          email: novaCredencial.Email,
          documento: documentoLimpo,
          tipoPessoa: cliente.PessoaFisicaId ? 'PF' : 'PJ',
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Erro no registro:', error);
      throw new InternalServerErrorException('Erro interno ao criar conta. Verifique se a tabela ClienteCredenciais existe no banco de dados.');
    }
  }

  async validateUser(payload: any): Promise<any> {
    const credencial = await this.credencialRepository.findOne({
      where: { Id: payload.sub, Ativo: true },
    });
    if (!credencial) {
      throw new UnauthorizedException();
    }
    return {
      credencialId: credencial.Id,
      clienteId: credencial.ClienteId,
      documento: payload.documento,
    };
  }
}
