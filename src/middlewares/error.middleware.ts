import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
    statusCode: number;
    data?: unknown;

    constructor(statusCode: number, message: string, data?: unknown) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
        this.name = "AppError";
    }
}

export function errorMiddleware(error: Error, _req: Request, res: Response, _next: NextFunction) {
    if(error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            data: error?.data,
        });
    }

    return res.status(500).json({
        success: false,
        message: "Erro interno do servidor.",
    });
}
