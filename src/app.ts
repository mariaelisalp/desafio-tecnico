import express, { Request, Response } from "express";
import userRouter from "./routes/users.routes";
import ticketRouter from "./routes/tickets.routes";
import utilsRouter from "./routes/utils.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();
app.use(express.json());

app.use(userRouter);
app.use(ticketRouter);
app.use(utilsRouter);

app.use(errorMiddleware);

app.listen(3000, function () {
    console.log("Server running on port 3000");
});
