import { Router } from "express";
import { sendRecoveryEmail } from "./mailsender.js";
import { checkOut } from "./mercadopago.js";

const router = Router();
router.post("/recovery", sendRecoveryEmail);
router.post("/checkout", checkOut);

export default router;
