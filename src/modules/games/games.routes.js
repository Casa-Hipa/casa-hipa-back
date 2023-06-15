import { Router } from "express";
import {
  getJuegos,
  saveGameColeccion,
  getIdsJuegosBGA,
  deleteGameCol,
  saveGameStore,
  getJuegosSinStock
} from "./games.controller.js";

const router = Router();
router.post("/", getJuegos);
router.get("/sinStock", getJuegosSinStock);
router.post("/coleccion/save", saveGameColeccion);
router.post("/coleccion/saveStore", saveGameStore);
router.post("/coleccion/", getIdsJuegosBGA);
router.delete("/coleccion/delete", deleteGameCol);
export default router;
