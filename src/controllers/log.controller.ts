import { NextFunction, Request, Response } from "express";
import logService from "../services/log.service";
import { AppError } from "../middlewares/error.middleware";
import { successResponse } from "../helpers/response.helper";

class LogController {
    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const logs = await logService.findAll();

            if(logs.length === 0) {
                throw new AppError(404, 'Nenhum log encontrado');
            }

            successResponse(res, 200, logs);

        } catch(error) {
            next(error);
        }
    }
}

export default new LogController();
