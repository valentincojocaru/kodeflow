import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import clientRouter from "./client";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(clientRouter);
router.use(adminRouter);

export default router;
