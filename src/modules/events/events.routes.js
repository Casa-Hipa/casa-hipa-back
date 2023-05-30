import { Router } from "express";
import {
  getEventos,
  registrarEntrada,
  registrarAsistente,
  getEventosById,
} from "./events.controller.js";

const router = Router();
router.get("/", getEventos);
router.post("/byid", getEventosById);
router.post("/new_blog", registrarEntrada);
router.post("/registrar_asistente", registrarAsistente);

export default router;
