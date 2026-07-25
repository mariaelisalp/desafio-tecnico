import { Request, Response } from "express";
import { database } from "../config/database";
import { successResponse } from "../helpers/response.helper";
import { AppError } from "../middlewares/error.middleware";

export async function checkApi(_req: Request, res: Response) {
    try {
        await database.$queryRaw`SELECT 1`;

        const data = {
            database: "connected",
            timestamp: new Date().toISOString(),
        }

        return successResponse(res, 200, data);

    } catch {

        const data = {
            database: "disconnected",
            timestamp: new Date().toISOString(),
        }

        throw new AppError(503, "API indisponível", data);
    }
}