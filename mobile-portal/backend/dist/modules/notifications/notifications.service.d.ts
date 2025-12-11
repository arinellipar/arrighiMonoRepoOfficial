import { Repository } from 'typeorm';
import { Boleto } from '../../entities/boleto.entity';
import { Contrato } from '../../entities/contrato.entity';
import { ClienteCredencial } from '../../entities/cliente-credencial.entity';
export interface Notification {
    id: string;
    tipo: 'boleto_vencendo' | 'boleto_vencido' | 'pagamento_confirmado' | 'novo_boleto';
    titulo: string;
    mensagem: string;
    data: Date;
    lida: boolean;
    dados?: any;
}
export declare class NotificationsService {
    private boletoRepository;
    private contratoRepository;
    private credencialRepository;
    constructor(boletoRepository: Repository<Boleto>, contratoRepository: Repository<Contrato>, credencialRepository: Repository<ClienteCredencial>);
    getNotifications(clienteId: number): Promise<Notification[]>;
    registerPushToken(clienteId: number, token: string): Promise<{
        success: boolean;
    }>;
}
