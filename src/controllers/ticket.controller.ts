import { NextFunction, Request, Response } from "express";
import ticketService from "../services/ticket.service";
import { successResponse } from "../helpers/response.helper";
import { AppError } from "../middlewares/error.middleware";

class TicketController {
    async createTicket(req: Request, res: Response, next: NextFunction) {
        try {
            const ticket = await ticketService.createTicket(req.body);

            return successResponse(res, 201, ticket);

        } catch (error) {
            next(error);
        }
    }

    async findTicket(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const ticket = await ticketService.findTicket(id);

            if (!ticket) {
                throw new AppError(404, "Nenhum ticket encontrado.");
            }

            return successResponse(res, 200, ticket);

        } catch (error) {
            next(error);
        }
    }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const tickets = await ticketService.findAll();

            if (tickets.length === 0) {
                throw new AppError(404, "Nenhum ticket encontrado.");
            }

            return successResponse(res, 200, tickets);

        } catch (error) {
            next(error);
        }
    }

    async updateTicket(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const ticket = await ticketService.updateTicket(id, req.body);

            return successResponse(res, 200, ticket);

        } catch (error) {
            next(error);
        }
    }

    async deleteTicket(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            await ticketService.deleteTicket(id);

            return successResponse(res, 200);
            
        } catch (error) {
            next(error);
        }
    }
}

export default new TicketController();
