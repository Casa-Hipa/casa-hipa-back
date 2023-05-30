// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// const prisma = new PrismaClient();

// const encryptPassword = async (password) => {
//   const salt = await bcrypt.genSalt(10);
//   const hash = await bcrypt.hash(password, salt);
//   return hash;
// };

// const matchPassword = async (password, savedPassword) => {
//   try {
//     return await bcrypt.compare(password, savedPassword);
//   } catch (e) {
//     console.log(e);
//   }
// };

// const signUp = async (req, res) => {
//   // comprobar que el usuario no existe
//   const { email, password, idRol } = req.body;
//   try {
//     const user = await prisma.usuarios.findFirst({
//       where: {
//         email,
//       },
//     });

//     if (user) {
//       return res
//         .status(400)
//         .json({ mensaje: "El usuario ya existe", status: 400 });
//     } else {
//       const data = await prisma.usuarios.create({
//         data: {
//           usuario,
//           nombrecompleto,
//           password: await encryptPassword(password),
//           estado: true,
//           roles: {
//             connect: {
//               id: parseInt(idRol),
//             },
//           },
//         },
//       });
//       const { id } = data;
//       const token = jwt.sign({ id }, process.env.SECRET, {
//         expiresIn: 86400, // 24 horas
//       });

//       const fecha = new Date();
//       const fechaExpiracion = new Date(fecha.getTime() + 86400000);
//       const fechaExpiracionFormateada = fechaExpiracion.toLocaleString();
//       res.status(200).json({
//         mensaje: "Usuario registrado correctamente",
//         token,
//         fechaExpiracion: fechaExpiracionFormateada,
//         status: 200,
//       });
//     }
//   } catch (error) {
//     res.status(400).json({ mensaje: "Error al crear usuario", status: 400 });
//   }
// };

// const signIn = async (req, res) => {
//   const { usuario, password } = req.body;
//   try {
//     const user = await prisma.usuarios.findFirst({
//       where: {
//         usuario,
//         estado: true,
//       },
//       include: {
//         roles: true,
//       },
//     });
//     if (!user) {
//       return res
//         .status(400)
//         .json({ mensaje: "El usuario no existe", status: 400 });
//     } else {
//       const match = await matchPassword(password, user.password);
//       if (!match)
//         return res
//           .status(400)
//           .json({ mensaje: "Usuario o Contraseña incorrectos", status: 400 });

//       const token = jwt.sign({ id: user.id }, process.env.SECRET, {
//         expiresIn: 86400, // 24 horas
//       });
//       console.log(user);
//       // res.status(200).json({ user, token, status: 200 });
//       const fecha = new Date();
//       const fechaExpiracion = new Date(fecha.getTime() + 86400000);
//       const fechaExpiracionFormateada = fechaExpiracion;
//       res.status(200).json({
//         token,
//         fechaExpiracion: fechaExpiracionFormateada,
//         role: user.roles.rol,
//         status: 200,
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res
//       .status(400)
//       .json({ mensaje: "Error al encontrar usuario", status: 400 });
//   }
// };

// export { encryptPassword, matchPassword, signUp, signIn };
