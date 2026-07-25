import { TicketChannel, TicketStatus } from "@prisma/client";
import ticketRepository from "../src/repositories/ticket.repository";
import { TicketPriority } from "../src/services/ticket.service";
import ticketService from "../src/services/ticket.service";
import ticketClassificationHelper from "../src/helpers/ticket-classification.helper";
import aiClassificationHelper from "../src/helpers/ai-classification.helper";

jest.mock("../src/repositories/ticket.repository", () => ({
    __esModule: true,
    default: {
        createTicket: jest.fn(),
        findTicket: jest.fn(),
        findAll: jest.fn(),
        updateTicket: jest.fn(),
        deleteTicket: jest.fn(),
    },
}));

jest.mock("../src/helpers/ticket-classification.helper", () => ({
    __esModule: true,
    default: { classify: jest.fn() },
}));

jest.mock("../src/helpers/ai-classification.helper", () => ({
    __esModule: true,
    default: { interact: jest.fn() },
}));

const repository = jest.mocked(ticketRepository);
const classifier = jest.mocked(ticketClassificationHelper);
const aiClassifier = jest.mocked(aiClassificationHelper);
const ticketInput = { solicitation: "O sistema apresenta erro de acesso ao login", userId: 1 };

describe("TicketService", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe("createTicket", () => {
        it("creates a ticket using a conclusive local classification", async () => {
            classifier.classify.mockResolvedValue({ channel: TicketChannel.SUPORTE_TECNICO, priority: TicketPriority.MEDIA, inconclusive: false, confidence: 100 });
            repository.createTicket.mockResolvedValue({ id: 1 } as never);

            await expect(ticketService.createTicket(ticketInput)).resolves.toEqual({ id: 1 });

            expect(aiClassifier.interact).not.toHaveBeenCalled();
            expect(repository.createTicket).toHaveBeenCalledWith({
                ...ticketInput,
                channel: TicketChannel.SUPORTE_TECNICO,
                priority: TicketPriority.MEDIA,
                status: TicketStatus.CLASSIFICADO,
            });
        });

        it("uses the AI result and flags ambiguous tickets for manual review", async () => {
            classifier.classify.mockResolvedValue({ channel: TicketChannel.FORA_DO_ESCOPO, priority: TicketPriority.BAIXA, inconclusive: true, confidence: 0 });
            aiClassifier.interact.mockResolvedValue({ channel: TicketChannel.FINANCEIRO, priority: TicketPriority.ALTA, ambiguous: true });
            repository.createTicket.mockResolvedValue({ id: 2 } as never);

            await ticketService.createTicket(ticketInput);

            expect(aiClassifier.interact).toHaveBeenCalledTimes(1);
            expect(repository.createTicket).toHaveBeenCalledWith(expect.objectContaining({
                channel: TicketChannel.FINANCEIRO,
                priority: TicketPriority.ALTA,
                status: TicketStatus.REVISAO_MANUAL,
            }));
        });
    });

    it("finds one ticket and lists all tickets", async () => {
        const tickets = [{ id: 1, ...ticketInput }];
        repository.findTicket.mockResolvedValue(tickets[0] as never);
        repository.findAll.mockResolvedValue(tickets as never);

        await expect(ticketService.findTicket(1)).resolves.toEqual(tickets[0]);
        await expect(ticketService.findAll()).resolves.toEqual(tickets);
    });

    describe("updateTicket", () => {
        it("updates an existing ticket", async () => {
            repository.findTicket.mockResolvedValue({ id: 1 } as never);
            repository.updateTicket.mockResolvedValue({ id: 1, ...ticketInput } as never);

            await expect(ticketService.updateTicket(1, ticketInput)).resolves.toMatchObject({ id: 1 });
            expect(repository.updateTicket).toHaveBeenCalledWith(1, ticketInput);
        });

        it("rejects an update for a missing ticket", async () => {
            repository.findTicket.mockResolvedValue(null);

            await expect(ticketService.updateTicket(99, ticketInput)).rejects.toMatchObject({ statusCode: 404, message: "Nenhum ticket encontrado." });
            expect(repository.updateTicket).not.toHaveBeenCalled();
        });
    });

    describe("deleteTicket", () => {
        it("marks an existing ticket as deleted", async () => {
            repository.findTicket.mockResolvedValue({ id: 1 } as never);
            repository.deleteTicket.mockResolvedValue({ id: 1, deletedAt: new Date() } as never);

            await expect(ticketService.deleteTicket(1)).resolves.toMatchObject({ id: 1 });
            expect(repository.deleteTicket).toHaveBeenCalledWith(1);
        });

        it("rejects deletion for a missing ticket", async () => {
            repository.findTicket.mockResolvedValue(null);

            await expect(ticketService.deleteTicket(99)).rejects.toMatchObject({ statusCode: 404, message: "Nenhum ticket encontrado." });
            expect(repository.deleteTicket).not.toHaveBeenCalled();
        });
    });
});
