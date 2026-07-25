import { TicketChannel, TicketStatus } from "@prisma/client";
import { database } from "../config/database";
import { EditTicketDto, TicketDto } from "../dto/ticket.dto";

class TicketRepository {
    async createTicket(data: any) {
        return database.ticket.create({
            data,
        });
    }

    async findTicket(id: number) {
        return database.ticket.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
    }

    async findAll() {
        return database.ticket.findMany({
            where: {
                deletedAt: null,
            },
        });
    }

    async updateTicket(id: number, data: EditTicketDto) {
        return database.ticket.update({
            where: { id },
            data: {
                status: data.status,
                channel: data.channel,
                priority: data.priority,
            },
        });
    }

    async deleteTicket(id: number) {
        return database.ticket.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
    }
}

export default new TicketRepository();
