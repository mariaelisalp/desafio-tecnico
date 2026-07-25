import { validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";

export function validationMiddleware(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    next();
}
