import { database } from "../config/database";

class LogRepository {
    async createLog(logData: any) {
        return database.log.create({
            data: logData
        });
    }

    async findLogs() {
        return await database.log.findMany();
    }
}

export default new LogRepository();