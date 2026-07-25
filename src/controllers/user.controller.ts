import { NextFunction, Request, Response } from "express";
import userService from "../services/user.service";
import { successResponse } from "../helpers/response.helper";
import { AppError } from "../middlewares/error.middleware";

class UserController {
    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await userService.createUser(req.body);
            return successResponse(res, 201, user);

        } catch (error) {
            next(error);
        }
    }

    async findUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const user = await userService.findUser(id);

            if (!user) {
                throw new AppError(404, "Usuário não encontrado.");
            }

            return successResponse(res, 200, user);

        } catch (error) {
            next(error);
        }
    }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await userService.findAll();

            if (users.length === 0) {
                throw new AppError(404, "Nenhum usuário encontrado.");
            }

            return successResponse(res, 200, users);

        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const user = await userService.updateUser(id, req.body);

            return successResponse(res, 200, user);

        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const deleted = await userService.deleteUser(id);

            return successResponse(res, 200, deleted);
            
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
