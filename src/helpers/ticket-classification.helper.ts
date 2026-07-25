import { TicketChannel } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import { TicketPriority } from "../services/ticket.service";
import { classificationTerms } from "./classification-terms";

type ChannelKey = keyof typeof classificationTerms;

class TicketClassificationHelper {

    public async classify(solicitation: string) {

        const normalized = this.normalizeSolicitation(solicitation);
        const words = new Set(normalized.split(/\s+/));

        if (words.size < 4) {
            throw new AppError(400, 'Texto da solicitação muito curto');
        }

        const scores = {
            [TicketChannel.OUVIDORIA]: 0,
            [TicketChannel.SAC]: 0,
            [TicketChannel.SUPORTE_TECNICO]: 0,
            [TicketChannel.FINANCEIRO]: 0,
        };

        for (const channel in classificationTerms) {
            const key = channel as ChannelKey;

            for (const term of classificationTerms[key]) {
                if (words.has(term)) {
                    scores[key]++;
                }
            }
        }

        const result = this.calculateConfidence(scores);

        return {
            ...result,
            priority: await this.setPriority(result.channel),
        };
    }

    private calculateConfidence(scores: any) {
        const ranked = (Object.entries(scores) as [ChannelKey, number][]).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

        const score = ranked.reduce((sum, [, score]) => sum + score, 0);
        const [winningChannel, winning] = ranked[0];
        const [, runnerUpScore] = ranked[1];

        const dominance = score === 0 ? 0 : winning / score;
        const confidence = Math.round(dominance * 100);

        if (winning === runnerUpScore || winning < 2 || confidence < 75) {
            return {
                channel: TicketChannel.FORA_DO_ESCOPO,
                confidence: 0,
                inconclusive: true,
            };
        }

        return {
            channel: winningChannel,
            confidence,
            inconclusive: false,
        };
    }

    private normalizeSolicitation(text: string) {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, "").toLowerCase().trim();
    }

    private async setPriority(channel: TicketChannel) {
        switch (channel) {
            case TicketChannel.FORA_DO_ESCOPO:
                return TicketPriority.BAIXA;

            case TicketChannel.OUVIDORIA:
                return TicketPriority.ALTA;

            default:
                return TicketPriority.MEDIA;
        }
    }
}

export default new TicketClassificationHelper();