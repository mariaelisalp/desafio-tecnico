import { EntityType, LogAction, TicketChannel, TicketStatus } from "@prisma/client";
import { EditTicketDto, TicketDto } from "../dto/ticket.dto";
import ticketRepository from "../repositories/ticket.repository";
import ticketClassificationHelper from "../helpers/ticket-classification.helper";
import aiClassificationHelper from "../helpers/ai-classification.helper";
import { AppError } from "../middlewares/error.middleware";
import logService from "./log.service";
import userService from "./user.service";

export enum TicketPriority {
    ALTA = 1,
    MEDIA = 2,
    BAIXA = 3,
}

const PROMPT = `
Você é um sistema responsável por classificar manifestações de uma plataforma de ouvidoria.
Sua tarefa é analisar o texto recebido e classificá-lo de acordo com as regras abaixo.

## Canais possíveis

- OUVIDORIA
- SAC
- SUPORTE_TECNICO
- FINANCEIRO
- FORA_DO_ESCOPO

## Prioridades possíveis

- ALTA
- MEDIA
- BAIXA

## Valores possíveis para ambiguidade

- 0
- 1

## Critérios de prioridade

ALTA
- Denúncias
- Assédio
- Fraudes
- Corrupção
- Violência
- Vazamento de dados
- Questões críticas que exigem ação imediata

MEDIA
- Reclamações
- Problemas operacionais
- Solicitações urgentes sem risco imediato

BAIXA
- Dúvidas
- Sugestões
- Elogios
- Solicitações comuns

## Regras

- Analise apenas o conteúdo do texto.
- Escolha apenas um canal.
- Escolha apenas uma prioridade.
- Caso exista mais de uma possibilidade, escolha a mais provável.
- Em caso de ambiguidade, marque 1 para ambíguo, do contrário, considere 0.
- Considere como FORA_DO_ESCOPO solicitações que não se encaixam em nenhum dos canais/informações incompletas.
- Nunca invente informações.

Não escreva nenhuma explicação.
Não utilize markdown.
Não escreva nenhuma palavra além da resposta.`;

class TicketService {
    async createTicket(data: TicketDto) {
        const user = await userService.findUser(data.userId);

        if(!user) {
            throw new AppError(422, 'Falha ao criar ticket pois esse usuário não existe');
        }
        
        const classification = await ticketClassificationHelper.classify(data.solicitation);

        let status;
        let ai = false;
        let channel = classification.channel;
        let priority = classification.priority;
        status = TicketStatus.CLASSIFICADO;

        if (classification.inconclusive) {
            try {
                const output = await aiClassificationHelper.interact(PROMPT, data.solicitation,
                    {
                        type: "object",
                        properties: {
                            channel: { type: "string", enum: Object.values(TicketChannel) },
                            priority: { type: "string", enum: [1, 2, 3] },
                            ambiguous: { type: "boolean", enum: [1, 0] }
                        },
                        required: ["channel", "priority", "ambiguous"],
                    }
                );

                channel = output.channel as TicketChannel;
                priority = output.priority as TicketPriority;

                if (output.ambiguous) {
                    status = TicketStatus.REVISAO_MANUAL;
                }

                ai = true;

            } catch {
                ai = false;
            }
        }

        try {
            const created = await ticketRepository.createTicket({
                solicitation: data.solicitation,
                userId: data.userId,
                channel,
                status,
                priority,
            });

            logService.createLog({
                entityType: EntityType.TICKET,
                entityId: created.id,
                action: LogAction.CREATE
            });

            logService.createLog({
                entityType: EntityType.TICKET,
                entityId: created.id,
                action: LogAction.TICKET_CLASSIFICATION,
                observation: ai ? 'Ticket classificado por IA' : 'Ticket classificado manualmente'
            });

            return created;

        } catch (error) {
            throw new AppError(500, "Erro ao criar ticket.");
        }
    }

    async findTicket(id: number) {
        try {
            return await ticketRepository.findTicket(id);

        } catch (error) {
            throw new AppError(500, "Erro ao buscar ticket.");
        }
    }

    async findAll() {
        try {
            return await ticketRepository.findAll();

        } catch (error) {
            throw new AppError(500, "Erro ao buscar tickets.");
        }
    }

    async updateTicket(id: number, data: EditTicketDto) {
        const ticket = await ticketRepository.findTicket(id);

        if (!ticket) {
            throw new AppError(404, "Nenhum ticket encontrado.");
        }

        if (ticket.userId != data.userId) {
            throw new AppError(422, "Esse ticket não pertence a esse usuário");
        }

        try {
            const updated = await ticketRepository.updateTicket(id, data);

            logService.createLog({
                entityType: EntityType.TICKET,
                entityId: updated.id,
                action: LogAction.UPDATE
            });

            return updated;

        } catch (error) {
            throw new AppError(500, "Erro ao atualizar ticket.");
        }
    }

    async deleteTicket(id: number) {
        const ticket = await ticketRepository.findTicket(id);

        if (!ticket) {
            throw new AppError(404, "Nenhum ticket encontrado.");
        }

        try {
            const deleted = await ticketRepository.deleteTicket(id);

            logService.createLog({
                entityType: EntityType.TICKET,
                entityId: deleted.id,
                action: LogAction.DELETE
            });

            return deleted;

        } catch (error) {
            throw new AppError(500, "Erro ao excluir ticket.");
        }
    }
}

export default new TicketService();