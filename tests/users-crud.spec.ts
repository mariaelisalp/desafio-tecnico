import bcrypt from "bcrypt";
import userRepository from "../src/repositories/user.repository";
import userService from "../src/services/user.service";

jest.mock("bcrypt", () => ({
    __esModule: true,
    default: { hash: jest.fn() },
}));

jest.mock("../src/repositories/user.repository", () => ({
    __esModule: true,
    default: {
        createUser: jest.fn(),
        findUser: jest.fn(),
        findUserByEmail: jest.fn(),
        findAll: jest.fn(),
        updateUser: jest.fn(),
        deleteUser: jest.fn(),
    },
}));

const repository = jest.mocked(userRepository);
const hash = jest.mocked(bcrypt.hash);

const userInput = {
    name: "Maria Silva",
    email: "maria@example.com",
    password: "senha-segura",
    phone: "11999999999",
};

describe("UserService", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe("createUser", () => {
        it("creates a user with a hashed password", async () => {
            hash.mockResolvedValue("hashed-password" as never);
            repository.findUserByEmail.mockResolvedValue(null);
            repository.createUser.mockResolvedValue({ id: 1, ...userInput, password: undefined } as never);

            await expect(userService.createUser(userInput)).resolves.toMatchObject({ id: 1, email: userInput.email });

            expect(hash).toHaveBeenCalledWith(userInput.password, 15);
            expect(repository.createUser).toHaveBeenCalledWith({ ...userInput, password: "hashed-password" });
        });

        it("rejects a duplicate email", async () => {
            hash.mockResolvedValue("hashed-password" as never);
            repository.findUserByEmail.mockResolvedValue({ id: 1 } as never);

            await expect(userService.createUser(userInput)).rejects.toMatchObject({
                statusCode: 400,
                message: "Email já cadastrado.",
            });
            expect(repository.createUser).not.toHaveBeenCalled();
        });

        it("rejects an email associated with a soft-deleted user", async () => {
            hash.mockResolvedValue("hashed-password" as never);
            repository.findUserByEmail.mockResolvedValue({ id: 1, deletedAt: new Date() } as never);

            await expect(userService.createUser(userInput)).rejects.toMatchObject({
                statusCode: 400,
                message: "Email já cadastrado.",
            });
            expect(repository.createUser).not.toHaveBeenCalled();
        });

    });

    it("finds one user and lists all users", async () => {
        const users = [{ id: 1, name: userInput.name }];
        repository.findUser.mockResolvedValue(users[0] as never);
        repository.findAll.mockResolvedValue(users as never);

        await expect(userService.findUser(1)).resolves.toEqual(users[0]);
        await expect(userService.findAll()).resolves.toEqual(users);
    });

    describe("updateUser", () => {
        it("updates an existing user and hashes a new password", async () => {
            hash.mockResolvedValue("new-hash" as never);
            repository.findUser.mockResolvedValue({ id: 1 } as never);
            repository.updateUser.mockResolvedValue({ id: 1, name: "Maria Souza" } as never);

            await expect(userService.updateUser(1, { name: "Maria Souza", password: "nova-senha" })).resolves.toMatchObject({ id: 1 });

            expect(repository.updateUser).toHaveBeenCalledWith(1, { name: "Maria Souza", password: "new-hash" });
        });

        it("rejects an update for a missing user", async () => {
            repository.findUser.mockResolvedValue(null);

            await expect(userService.updateUser(99, { name: "Inexistente" })).rejects.toMatchObject({
                statusCode: 404,
                message: "Usuário não encontrado.",
            });
            expect(repository.updateUser).not.toHaveBeenCalled();
        });
    });

    describe("deleteUser", () => {
        it("soft-deletes an existing user", async () => {
            repository.findUser.mockResolvedValue({ id: 1 } as never);
            repository.deleteUser.mockResolvedValue({ id: 1, deletedAt: new Date() } as never);

            await expect(userService.deleteUser(1)).resolves.toMatchObject({ id: 1 });
            expect(repository.deleteUser).toHaveBeenCalledWith(1);
        });

        it("rejects deletion for a missing user", async () => {
            repository.findUser.mockResolvedValue(null);

            await expect(userService.deleteUser(99)).rejects.toMatchObject({
                statusCode: 404,
                message: "Usuário não encontrado.",
            });
            expect(repository.deleteUser).not.toHaveBeenCalled();
        });
    });
});
