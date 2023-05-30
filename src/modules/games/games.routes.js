import { Router } from "express";
import {
  getJuegos,
  saveGameColeccion,
  getIdsJuegosBGA,
  deleteGameCol,
  saveGameStore,
} from "./games.controller.js";

const router = Router();
router.post("/", getJuegos);
router.post("/coleccion/save", saveGameColeccion);
router.post("/coleccion/saveStore", saveGameStore);
router.post("/coleccion/", getIdsJuegosBGA);
router.delete("/coleccion/delete", deleteGameCol);
export default router;
