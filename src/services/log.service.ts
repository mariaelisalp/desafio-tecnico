import { LogDto } from "../dto/log.dto";
import { AppError } from "../middlewares/error.middleware";
import logRepository from "../repositories/log.repository";

class LogService {

    async createLog(logData: LogDto) {
        try {
            return await logRepository.createLog(logData);

        }catch(error) {
            throw new AppError(500, 'Erro ao registrar log.');
        }
    }

    async findAll() {
        return logRepository.findLogs();
    }

}

export default new LogService();