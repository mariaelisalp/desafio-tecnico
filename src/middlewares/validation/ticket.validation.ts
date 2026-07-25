import { body } from "express-validator";

export function validate(method: string) {
    switch (method) {
        case "ticket":
            return [
                body("solicitation", "Campo solicitação é obrigatório.").exists().isString(),
                body("userId", "Campo userId é obrigatório.").exists().isNumeric(),
            ];

        case "updateTicket":
            return [
                body("userId", "Campo userId é obrigatório.").isNumeric(),
                body("channel", "Campo canal deve ser uma string.").isString().optional(),
                body("status", "Campo status deve ser uma string.").isString().optional(),
                body("priority", "Campo prioridade deve ser numérico.").isNumeric().optional()
            ]
        default:
            return [];
    }
}