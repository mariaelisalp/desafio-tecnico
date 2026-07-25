import { TicketChannel } from "@prisma/client";

export const classificationTerms = {
    [TicketChannel.OUVIDORIA]: [
        "denuncia", "assedio", "fraude", "corrupcao", "conduta", "etica", "importunacao", "moral", "agressao"
    ],
    [TicketChannel.SAC]: [
        "produto", "entrega", "assinatura", "cancelamento", "cancelar", "atendimento", "sac", "compra", "venda", "duvida"
    ],
    [TicketChannel.SUPORTE_TECNICO]: [
        "erro", "acesso", "bug", "indisponibilidade", "indisponivel", "falha", "senha", "email", "sistema", "instabilidade", "site", "login", "acessar"
    ],
    [TicketChannel.FINANCEIRO]: [
        "cobranca", "reembolso", "pagamento", "pagar", "financeiro", "boleto", "cartao", "credito", "debito", "pix", "banco", "nota"
    ]
};