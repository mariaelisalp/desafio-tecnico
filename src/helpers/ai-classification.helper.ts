import { GoogleGenAI } from "@google/genai";
import { AppError } from "../middlewares/error.middleware";

class AiClassificationHelper {

    public async interact(prompt: string, value: string, schema: any) {
        
        if (!process.env.GEMINI_API_KEY) {
            throw new AppError(503, "Chave da API Gemini não configurada.");
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        try {
            const interaction = await ai.interactions.create({
                model: "gemini-3.5-flash",
                input: [
                    { type: "text", text: prompt },
                    { type: "text", text: value },
                ],
                response_format: {
                    type: "text",
                    mime_type: "application/json",
                    schema,
                },
            });

            const outputText = interaction.output_text?.trim();

            if (!outputText) {
                throw new AppError(500, "Resposta da IA vazia.");
            }

            return JSON.parse(outputText);

        } catch (error) {
            throw new AppError(500, "Erro ao se comunicar com a IA.");
        }
    }
}

export default new AiClassificationHelper();
