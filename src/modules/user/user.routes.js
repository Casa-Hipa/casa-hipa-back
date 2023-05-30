import { Router } from "express";
import {
  encryptPassword,
  matchPassword,
  signUp,
  signIn,
  getUsuarios,
  forgotPassword,
  getUsuarioByEmail,
  updateUsuario,
  changePass,
  desactUsuario,
} from "./user.controller.js";

const router = Router();
router.get("/", getUsuarios);
router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/forgot", forgotPassword);
router.post("/", getUsuarioByEmail);
router.put("", updateUsuario);
router.put("/changepass", changePass);
router.put("/desact", desactUsuario);

export default router;
