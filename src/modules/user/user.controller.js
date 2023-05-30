import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import generator from "generate-password";
import { sendRecoveryEmail } from "../../utils/mailsender.js";

const prisma = new PrismaClient();

const secret =
  process.env.SECRET || env.SECRET || "22d0c8fa-cea8-40e4-8cd6-9d3d22aef717";

const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const matchPassword = async (password, savedPassword) => {
  try {
    return await bcrypt.compare(password, savedPassword);
  } catch (e) {}
};

const signUp = async (req, res) => {
  // comprobar que el usuario no existe
  const { email, password } = req.body;
  try {
    const user = await prisma.usuarios.findFirst({
      where: {
        email,
      },
    });

    if (user) {
      return res
        .status(400)
        .json({ mensaje: "El usuario ya existe", status: 400 });
    } else {
      const data = await prisma.$transaction([
        prisma.usuarios.create({
          data: {
            email,
            password: await encryptPassword(password),
            estado: true,
            id_rol: 2,
          },
        }),
        prisma.colecciones.create({
          data: {
            mail_usuario: email,
            nombre: "Default",
          },
        }),
      ]);

      // const data = await prisma.usuarios.create({
      //   data: {
      //     email,
      //     password: await encryptPassword(password),
      //     estado: true,
      //     id_rol: 2,
      //   },
      // });
      const { id } = data;
      const token = jwt.sign({ id }, secret, {
        expiresIn: 86400, // 24 horas
      });

      const fecha = new Date();
      const fechaExpiracion = new Date(fecha.getTime() + 86400000);
      const fechaExpiracionFormateada = fechaExpiracion.toLocaleString();
      res.status(200).json({
        mensaje: "Usuario registrado correctamente",
        token,
        fechaExpiracion: fechaExpiracionFormateada,
        status: 200,
      });
    }
  } catch (error) {
    res.status(400).json({ mensaje: "Error al crear usuario", status: 400 });
  } finally {
    await prisma.$disconnect();
  }
};

const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.usuarios.findFirst({
      where: {
        email,
        estado: true,
      },
      include: {
        roles: true,
        colecciones: true,
      },
    });
    if (!user) {
      return res
        .status(400)
        .json({ mensaje: "El usuario no existe", status: 400 });
    } else {
      const match = await matchPassword(password, user.password);
      if (!match) {
        return res
          .status(400)
          .json({ mensaje: "Usuario o Contraseña incorrectos", status: 400 });
      }

      const token = jwt.sign({ id: user.email }, secret, {
        expiresIn: 86400, // 24 horas
      });

      const fecha = new Date();
      const fechaExpiracion = new Date(fecha.getTime() + 86400000);
      const fechaExpiracionFormateada = fechaExpiracion;
      res.status(200).json({
        token,
        email,
        fechaExpiracion: fechaExpiracionFormateada,
        role: user.roles.rol,
        status: 200,
        id_coleccion_default: user.colecciones[0].id_coleccion,
      });
    }
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al encontrar usuario", status: 400 });
  } finally {
    await prisma.$disconnect();
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.usuarios.findFirst({
      where: {
        email: email,
        estado: true,
      },
    });
    if (!user) {
      return res
        .status(400)
        .json({ mensaje: "El usuario no existe", status: 400 });
    } else {
      var newpassword = generator.generate({
        length: 10,
        numbers: true,
      });
      if (newpassword) {
        try {
          const data = await prisma.usuarios.update({
            where: {
              email,
            },
            data: {
              password: await encryptPassword(newpassword),
            },
          });
          sendRecoveryEmail(email, newpassword);
          res.status(200).json({
            mensaje: "Pass enviada a su correo electrónico",
            status: 200,
          });
        } catch (error) {
          res
            .status(400)
            .json({ mensaje: "Error al generar password nueva", status: 400 });
        } finally {
          await prisma.$disconnect();
        }
      }
    }
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al encontrar usuario", status: 400 });
  }
};

const getUsuarios = async (req, res) => {
  try {
    const usuarios = [];
    const data = await prisma.usuarios.findMany({
      include: {
        roles: true,
        dietas: true,
      },
      where: {
        estado: true,
      },
    });
    data.forEach((user) => {
      const {
        email,
        nombre,
        apellido,
        telefono,
        fecha_nacimiento,
        roles: { rol },
        dietas,
        foto_perfil,
        estado,
        fecha_registro,
      } = user;
      usuarios.push({
        email,
        nombre,
        apellido,
        fecha_registro,
        fecha_nacimiento,
        telefono,
        rol,
        dietas,
        foto_perfil,
        estado,
      });
    });
    res.status(200).json({ data: usuarios, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al obtener usuarios", status: 400 });
  } finally {
    await prisma.$disconnect();
  }
};

const getUsuarioByEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.usuarios.findFirst({
      where: {
        email,
        estado: true,
      },
      include: {
        roles: true,
        colecciones: { where: { nombre: "Default" } },
        eventos_usuarios: true,
      },
    });
    if (!user) {
      return res
        .status(400)
        .json({ mensaje: "El usuario no existe", status: 400 });
    } else {
      if (user.fecha_nacimiento) {
        const fechaFormateada =
          user.fecha_nacimiento.getFullYear() +
          "-" +
          (user.fecha_nacimiento.getMonth() + 1).toString().padStart(2, "0") +
          "-" +
          (user.fecha_nacimiento.getDate() + 1).toString().padStart(2, "0");
        user.fecha_nacimiento = fechaFormateada;
      }

      delete user["password"];
      res.status(200).json({
        user,
        status: 200,
      });
    }
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al encontrar usuario", status: 400 });
  } finally {
    await prisma.$disconnect();
  }
};

const updateUsuario = async (req, res) => {
  const {
    email,
    nombre,
    apellido,
    fecha_nacimiento,
    foto_perfil,
    instagram,
    facebook,
    telefono,
  } = req.body;
  try {
    const usuarioFound = await prisma.usuarios.findUnique({
      where: {
        email,
      },
    });

    if (!usuarioFound) {
      return res
        .status(400)
        .json({ mensaje: "El usuario no existe", status: 400 });
    }

    const data = await prisma.usuarios.update({
      where: {
        email,
      },
      data: {
        nombre,
        apellido,
        fecha_nacimiento,
        foto_perfil: Buffer.from(foto_perfil, "binary"),
        instagram,
        facebook,
        telefono,
      },
    });
    res
      .status(200)
      .json({ mensaje: "Usuario actualizado correctamente", status: 200 });
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al actualizar usuario", status: 400 });
  } finally {
    await prisma.$disconnect();
  }
};

const changePass = async (req, res) => {
  const { email, password, nuevapassword } = req.body;
  try {
    const user = await prisma.usuarios.findFirst({
      where: {
        email,
        estado: true,
      },
      include: {
        roles: true,
      },
    });
    if (!user) {
      return res
        .status(400)
        .json({ mensaje: "El usuario no existe", status: 400 });
    } else {
      const match = await matchPassword(password, user.password);
      if (!match) {
        return res
          .status(400)
          .json({ mensaje: "Usuario o Contraseña incorrectos", status: 400 });
      }
      const data = await prisma.usuarios.update({
        where: {
          email,
        },
        data: {
          password: await encryptPassword(nuevapassword),
        },
      });
      res.status(200).json({
        mensaje: "Pass cambiada correctamente",
        status: 200,
      });
    }
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al encontrar usuario", status: 400 });
  } finally {
    await prisma.$disconnect();
  }
};

const desactUsuario = async (req, res) => {
  const { email } = req.body;
  try {
    const usuarioFound = await prisma.usuarios.findUnique({
      where: {
        email,
      },
    });

    if (!usuarioFound) {
      return res
        .status(400)
        .json({ mensaje: "El usuario no existe", status: 400 });
    }

    const data = await prisma.usuarios.update({
      where: {
        email,
      },
      data: {
        estado: false,
      },
    });
    res
      .status(200)
      .json({ mensaje: "Usuario desactivado correctamente", status: 200 });
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al desactivar usuario", status: 400 });
  } finally {
    await prisma.$disconnect();
  }
};
export {
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
};
