import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

const isAdmin = async (req, res, next) => {
  const user = await prisma.usuarios.findUnique({
    where: {
      email: req.email,
    },
  });

  const rolFound = await prisma.roles.findUnique({
    where: {
      id: user.id_rol,
    },
  });

  if (rolFound.rol === "ADMIN") {
    next();
    return;
  }
  return res.status(403).json({ mensaje: "Requiere Rol de Administrador!" });
};

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];

    if (!token)
      return res.status(403).json({ mensaje: "No proporciono Token" });

    const decoded = jwt.verify(token, process.env.SECRET);
    req.userId = decoded.id;

    const user = await prisma.usuarios.findUnique({
      where: {
        id: req.userId,
      },
    });

    // tomar fecha de expiracion del token y comparar con la fecha actual
    const fechaExpiracion = new Date(decoded.exp * 1000); // fecha de expiracion del token
    const fechaActual = new Date(); // fecha actual
    if (fechaExpiracion < fechaActual)
      return res.status(401).json({ mensaje: "Token expirado" }); // 401: Unauthorized

    if (!user)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "No esta Autorizado!" });
  }
};
export { verifyToken, isAdmin };
