import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import generator from "generate-password";
import { sendRecoveryEmail } from "../../utils/mailsender.js";

const prisma = new PrismaClient();

const secret = process.env.SECRET || env.SECRET;

const getEventos = async (req, res) => {
  try {
    const entradas = [];
    const data = await prisma.entradas_blog.findMany({
      include: {
        usuarios: true,
      },
      orderBy: {
        fecha: "desc",
      },
    });
    data.forEach((event) => {
      const {
        fecha,
        titulo,
        parrafo,
        imagen,
        imagen_ruta,
        usuarios: { nombre },
        usuarios: { apellido },
        categoria,
        evento,
        precio,
        id_evento,
        fecha_inicio,
      } = event;
      entradas.push({
        fecha,
        titulo,
        parrafo,
        imagen,
        imagen_ruta,
        nombre,
        apellido,
        categoria,
        evento,
        precio,
        id_evento,
        fecha_inicio,
      });
    });
    res.status(200).json({ data: entradas, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al obtener entradas", status: 400 });
  } finally {
    await prisma.$disconnect();
  }
};

const registrarEntrada = async (req, res) => {
  const {
    imagen,
    imagen_ruta,
    titulo,
    parrafo,
    email_usuario,
    categoria,
    evento,
    precio,
    fecha_inicio,
  } = req.body;
  try {
    const data = await prisma.eventos.create({
      data: {
        titulo,
        fecha_inicio,
        precio,
        limite_asistentes: 100,
      },
    });

    if (data) {
      const entrada = await prisma.entradas_blog.create({
        data: {
          imagen,
          imagen_ruta,
          titulo,
          parrafo,
          email_usuario,
          categoria,
          evento,
          precio,
          id_evento: data.id_evento,
        },
      });
    }

    res.status(200).json({
      mensaje: "Entrada de blog registrada correctamente",
      status: 200,
    });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ mensaje: "Error al crear entrada de blog", status: 400 });
  }
};

const registrarAsistente = async (req, res) => {
  const { id_evento, email_usuario } = req.body;
  try {
    const data = await prisma.eventos_usuarios.create({
      data: {
        id_evento: parseInt(id_evento),
        email_usuario,
      },
    });

    res.status(200).json({
      mensaje: "Asistente registrado",
      status: 200,
    });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ mensaje: "Error al registrar asistente de evento", status: 400 });
  }
};

const getEventosById = async (req, res) => {
  try {
    const data = await prisma.$queryRawUnsafe(
      `SELECT *
      FROM eventos e
      INNER JOIN eventos_usuarios eu ON e.id_evento = eu.id_evento WHERE email_usuario = $1`,
      `${req.body.email}`
    );

    res.status(200).json({ data: data, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al obtener eventos", status: 400 });
  } finally {
    await prisma.$disconnect();
  }
};
export { getEventos, registrarEntrada, registrarAsistente, getEventosById };
