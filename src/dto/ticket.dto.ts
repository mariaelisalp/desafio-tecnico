import { TicketChannel, TicketStatus } from "@prisma/client";
import { TicketPriority } from "../services/ticket.service";

export interface TicketDto {
    solicitation: string;
    userId: number;
}

export interface EditTicketDto {
    status?: TicketStatus;
    channel?: TicketChannel;
    priority?: TicketPriority;
    userId: number
}