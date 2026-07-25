import { Router } from "express";
import ticketController from "../controllers/ticket.controller";
import { validate } from "../middlewares/validation/ticket.validation";
import { validationMiddleware } from "../middlewares/validation/validation.middleware";

const router = Router();

router.post("/tickets", validate("ticket"), validationMiddleware, ticketController.createTicket);
router.get("/tickets", ticketController.findAll);
router.get("/tickets/:id", ticketController.findTicket);
router.put("/tickets/:id", validate("updateTicket"), validationMiddleware, ticketController.updateTicket);
router.delete("/tickets/:id", ticketController.deleteTicket);

export default router;