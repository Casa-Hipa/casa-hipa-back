import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getJuegos = async (req, res) => {
  const name = req.body.name;
  console.log(typeof name);
  try {
    const data = await prisma.$queryRawUnsafe(
      `SELECT *
    FROM juegos
    WHERE name ILIKE $1
        AND (
            minplayers IS NOT NULL
            AND minplayers <> ''
            )
        AND (
            maxplayers IS NOT NULL
            AND maxplayers <> ''
            )`,
      `%${name}%`
    );
    res.status(200).json({ data: data, status: 200 });
  } catch (error) {
    res.status(400).json({ mensaje: "Error al obtener juegos", status: 400 });
  } finally {
    await prisma.$disconnect();
  }
};

const saveGameColeccion = async (req, res) => {
  const { id_juego, id_coleccion } = req.body;

  try {
    const game = await prisma.juegos_colecciones.findFirst({
      where: {
        id_juego,
        id_coleccion: parseInt(id_coleccion),
      },
    });
    if (game) {
      return res
        .status(400)
        .json({ mensaje: "Ya tienes este juego en tu coleccion", status: 400 });
    } else {
      const data = await prisma.juegos_colecciones.create({
        data: {
          id_juego,
          id_coleccion: parseInt(id_coleccion),
        },
      });
      res.status(200).json({ data: data, status: 200 });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      mensaje: "Error al grabar el juego en la coleccion",
      status: 400,
    });
  } finally {
    await prisma.$disconnect();
  }
};

const saveGameStore = async (req, res) => {
  const { id_juego, id_coleccion } = req.body;

  try {
    const game = await prisma.$queryRawUnsafe(
      `SELECT *
    FROM juegos_colecciones
    WHERE id_juego = $1
        AND 
          id_coleccion = 4`,
      `${id_juego}`
    );
    if (Array.isArray(game) && game.length > 0) {
      console.log(game);

      const resultado = await prisma.$queryRawUnsafe(
        `UPDATE juegos_colecciones
          SET stock = stock + 1
      WHERE id_juego = $1
          AND 
            id_coleccion = 4 RETURNING stock`,
        `${id_juego}`
      );

      res.status(200).json({ data: resultado[0].stock, status: 200 });
    } else {
      const data = await prisma.juegos_colecciones.create({
        data: {
          id_juego,
          id_coleccion: 4,
        },
      });
      console.log(data);
      res.status(200).json({ data: data.stock, status: 200 });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      mensaje: "Error al grabar el juego en la coleccion",
      status: 400,
    });
  } finally {
    await prisma.$disconnect();
  }
};

const getIdsJuegosBGA = async (req, res) => {
  try {
    let stringIds = "";
    const id_coleccion = req.body.id_coleccion;
    const data = await prisma.juegos_colecciones.findMany({
      where: {
        id_coleccion: parseInt(id_coleccion),
      },
    });
    data.forEach((game) => {
      stringIds = stringIds + game.id_juego;
      stringIds = stringIds + ",";
    });
    stringIds = stringIds.slice(0, -1);

    res.status(200).json({ data: stringIds, status: 200 });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al obtener ids de tu colecccion de juegos",
      status: 400,
    });
  } finally {
    await prisma.$disconnect();
  }
};
const deleteGameCol = async (req, res) => {
  const { id_juego, id_coleccion } = req.body;
  try {
    await prisma.juegos_colecciones.deleteMany({
      where: {
        id_juego,
        id_coleccion: parseInt(id_coleccion),
      },
    });
    res.status(200).json({ mensaje: "Juego borrado", status: 200 });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      mensaje: "Error al borrar el juego de tu colecccion de juegos",
      status: 400,
    });
  } finally {
    await prisma.$disconnect;
  }
};
export {
  getJuegos,
  saveGameColeccion,
  getIdsJuegosBGA,
  deleteGameCol,
  saveGameStore,
};
