import { database } from "../config/database";
import { UpdateUserDto, UserDto } from "../dto/user.dto";

const userPublicSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
};

class UserRepository {
    async createUser(data: UserDto) {
        return database.user.create({
            data,
            select: userPublicSelect,
        });
    }

    async findUser(id: number) {
        return database.user.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            select: userPublicSelect,
        });
    }

    async findUserByEmail(email: string) {
        return database.user.findUnique({
            where: { email },
            select: userPublicSelect,
        });
    }

    async findAll() {
        return database.user.findMany({
            where: {
                deletedAt: null,
            },
            select: userPublicSelect,
        });
    }

    async updateUser(id: number, data: UpdateUserDto) {
        return database.user.update({
            where: { id },
            data,
            select: userPublicSelect,
        });
    }

    async deleteUser(id: number) {
        return database.user.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
            select: userPublicSelect,
        });
    }
}

export default new UserRepository();
