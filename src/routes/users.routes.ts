import { Router } from "express";
import userController from "../controllers/user.controller";
import { validate } from "../middlewares/validation/user.validation";
import { validationMiddleware } from "../middlewares/validation/validation.middleware";

const router = Router();

router.post("/users", validate("createUser"), validationMiddleware, userController.createUser);
router.get("/users", userController.findAll);
router.get("/users/:id", userController.findUser);
router.put("/users/:id", validate("updateUser"), validationMiddleware, userController.updateUser);
router.delete("/users/:id", userController.deleteUser);

export default router;