import { Router } from "express";
import { checkApi } from "../controllers/health-check.controller";
import logController from "../controllers/log.controller";

const router = Router();

router.get("/health", checkApi);
router.get("/logs", logController.findAll);

export default router;