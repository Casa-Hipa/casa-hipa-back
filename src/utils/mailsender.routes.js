import { Router } from "express";
import { sendRecoveryEmail } from "./mailsender.js";
import { checkOut, ventaTienda } from "./mercadopago.js";

const router = Router();
router.post("/recovery", sendRecoveryEmail);
router.post("/checkout", checkOut);
router.post("/ventaTienda", ventaTienda);

export default router;
