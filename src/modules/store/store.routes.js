import { Router } from "express";
import {getChartAreaAsistencias, getAsistenciasEventos, getStoreIdsJuegosBGA, updateGameStore, createFactura, getFacturas,getTortaMecanicas, getBarrasVentas, getTortaEdades } from "./store.controller.js";
const router = Router();

router.get("/", getStoreIdsJuegosBGA);
router.get("/facturas", getFacturas);
router.get("/asistencias", getAsistenciasEventos);
router.post("/barrasVentas", getBarrasVentas);
router.post("/chartAsistencia", getChartAreaAsistencias);
router.get("/torta", getTortaMecanicas);
router.get("/tortaEdades", getTortaEdades);
router.put("/update", updateGameStore);
router.post("/createFactura", createFactura);
export default router;
