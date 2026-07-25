import { body } from "express-validator";

export function validate(method: string) {
    switch (method) {
        case "createUser":
            return [
                body("name", "Campo nome é obrigatório.").exists().isString(),
                body("email", "Campo email é obrigatório").exists(),
                body("email", "Email inválido.").isEmail(),
                body("phone").optional().isString(),
                body("password", "Campo senha é obrigatório.").exists(),
                body("password", "Senha deve conter pelo menos 8 caracteres").isLength({min: 8})
            ];

        case "updateUser":
            return [
                body("name").optional().isString(),
                body("email").optional().isEmail().withMessage("Email inválido."),
                body("phone").optional().isString(),
                body("password").optional().isString(),
            ];

        default:
            return [];
    }
}
