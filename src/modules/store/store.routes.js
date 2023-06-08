import { Router } from "express";
import { getStoreIdsJuegosBGA, updateGameStore, createFactura } from "./store.controller.js";
const router = Router();

router.get("/", getStoreIdsJuegosBGA);
router.put("/update", updateGameStore);
router.post("/createFactura", createFactura);
export default router;
