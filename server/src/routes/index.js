import { Router } from "express";
import contactRouter from "./contact.routes.js";
import dashboardRouter from "./dashboard.routes.js";
import donationRouter from "./donation.routes.js";
import fundingRouter from "./funding.routes.js";
import healthRouter from "./health.routes.js";
import userRouter from "./user.routes.js";

const apiRouter = Router();
apiRouter.use("/health", healthRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/donations", donationRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/fundings", fundingRouter);
apiRouter.use("/contacts", contactRouter);

export default apiRouter;
