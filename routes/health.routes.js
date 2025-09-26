import express from "express";
import { checkHealth } from "../controllers/health.controller";

const router = express.Router();

router.get('/health', checkHealth);

export default router;