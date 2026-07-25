import bcrypt from "bcrypt";
import { UpdateUserDto, UserDto } from "../dto/user.dto";
import { AppError } from "../middlewares/error.middleware";
import userRepository from "../repositories/user.repository";
import logService from "./log.service";
import { EntityType, LogAction } from "@prisma/client";

class UserService {
    async createUser(data: UserDto) {
        const hashedPassword = await bcrypt.hash(data.password, 15);

        const user = await userRepository.findUserByEmail(data.email);

        if (user) {
            throw new AppError(400, "Email já cadastrado.");
        }

        try {
            const created = await userRepository.createUser({
                ...data,
                password: hashedPassword,
            });

            logService.createLog({
                entityType: EntityType.USER,
                entityId: created.id,
                action: LogAction.CREATE
            });

            return created;

        } catch (error) {
            throw new AppError(500, "Erro ao criar usuário.");
        }
    }

    async findUser(id: number) {
        try {
            return await userRepository.findUser(id);

        } catch (error) {
            throw new AppError(500, "Erro ao buscar usuário.");
        }
    }

    async findAll() {
        try {
            return await userRepository.findAll();

        } catch (error) {
            throw new AppError(500, "Erro ao buscar usuários.");
        }
    }

    async updateUser(id: number, data: UpdateUserDto) {
        const user = await userRepository.findUser(id);

        if (!user) {
            throw new AppError(404, "Usuário não encontrado.");
        }

        if (data.email) {
            const existing = await userRepository.findUserByEmail(data.email);
            
            if (existing && existing.id !== id) {
                throw new AppError(400, "Email já cadastrado.");
            }
        }

        const updateData: UpdateUserDto = { ...data };

        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 15);
        }

        try {
            const updated = await userRepository.updateUser(id, updateData);

            logService.createLog({
                entityType: EntityType.USER,
                entityId: updated.id,
                action: LogAction.UPDATE
            });

            return updated;

        } catch (error) {
            throw new AppError(500, "Erro ao atualizar usuário");
        }
    }

    async deleteUser(id: number) {
        const user = await userRepository.findUser(id);

        if (!user) {
            throw new AppError(404, "Usuário não encontrado.");
        }

        try {
            const deleted = await userRepository.deleteUser(id);

            logService.createLog({
                entityType: EntityType.USER,
                entityId: deleted.id,
                action: LogAction.DELETE
            });

            return deleted;

        } catch (error) {
            throw new AppError(500, "Erro ao excluir usuário.");
        }
    }
}

export default new UserService();