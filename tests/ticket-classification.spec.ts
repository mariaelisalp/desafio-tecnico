import { TicketChannel } from "@prisma/client";
import { TicketPriority } from "../src/services/ticket.service";
import ticketClassificationHelper from "../src/helpers/ticket-classification.helper";

describe("TicketClassificationHelper", () => {
    it("rejects solicitations with fewer than four words", async () => {
        await expect(ticketClassificationHelper.classify("Ocorreu um problema")).rejects.toMatchObject({
            statusCode: 400,
            message: "Texto da solicitação muito curto",
        });
    });

    it("classifies an ombudsman complaint as high priority", async () => {
        await expect(ticketClassificationHelper.classify("Denúncia de fraude e assédio moral hoje")).resolves.toEqual({
            channel: TicketChannel.OUVIDORIA,
            confidence: 100,
            inconclusive: false,
            priority: TicketPriority.ALTA,
        });
    });

    it("classifies technical support requests as medium priority", async () => {
        await expect(ticketClassificationHelper.classify("O sistema apresenta erro de acesso ao login")).resolves.toEqual({
            channel: TicketChannel.SUPORTE_TECNICO,
            confidence: 100,
            inconclusive: false,
            priority: TicketPriority.MEDIA,
        });
    });

    it("marks unclear solicitations as inconclusive and low priority", async () => {
        await expect(ticketClassificationHelper.classify("Preciso de ajuda com isso")).resolves.toEqual({
            channel: TicketChannel.FORA_DO_ESCOPO,
            confidence: 0,
            inconclusive: true,
            priority: TicketPriority.BAIXA,
        });
    });
});
