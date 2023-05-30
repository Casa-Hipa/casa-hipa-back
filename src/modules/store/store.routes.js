import { Router } from "express";
import { getStoreIdsJuegosBGA, updateGameStore } from "./store.controller.js";
const router = Router();

router.get("/", getStoreIdsJuegosBGA);
router.put("/update", updateGameStore);
export default router;
