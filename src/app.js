import express from "express";
import cors from "cors";
const app = express();
// const jwt = require("jsonwebtoken");

//rutas
import usuarioRoutes from "./modules/user/user.routes.js";
import utilsRoutes from "./utils/mailsender.routes.js";
import eventsRoutes from "./modules/events/events.routes.js";
import juegosRoutes from "./modules/games/games.routes.js";
import storeRoutes from "./modules/store/store.routes.js";

const secret = process.env.SECRET || "22d0c8fa-cea8-40e4-8cd6-9d3d22aef717";

// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// app.post("/login", async (req, res) => {
//   const user = await prisma.usuarios.findFirst({
//     select: {
//       email: true,
//     },
//     where: {
//       email: req.body.email,
//       password: req.body.password,
//     },
//   });

//   if (user) {
//     const { email: sub, password: name } = user;
//     const token = jwt.sign(
//       {
//         sub,
//         name,
//         exp: Date.now() + 60 * 1000,
//       },
//       secret
//     );
//     res.json(token);
//   } else {
//     res.status(404).send({ msg: "no anda" });
//   }
// });

app.use("/usuarios", usuarioRoutes);
app.use("/utils", utilsRoutes);
app.use("/eventos", eventsRoutes);
app.use("/juegos", juegosRoutes);
app.use("/store", storeRoutes);

app.listen(3000, () => {
  console.log("tuki, app andando...");
});
export default app;
