import { Response } from "express";

export function successResponse(res: Response, status: number, data?: any) {
    return res.status(status).json({
        success: true,
        data,
    });
}
