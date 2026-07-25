import { EntityType, LogAction } from "@prisma/client";

export interface LogDto {
    entityType: EntityType;
    entityId: number;
    action: LogAction;
    observation?: string;
}