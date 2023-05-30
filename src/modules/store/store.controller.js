import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getStoreIdsJuegosBGA = async (req, res) => {
  try {
    let stringIds = "";
    const id_coleccion = 4; //req.body.id_coleccion;
    const data = await prisma.juegos_colecciones.findMany({
      where: {
        id_coleccion: parseInt(id_coleccion),
        stock: { gt: 0 },
      },
    });
    data.forEach((game) => {
      stringIds = stringIds + game.id_juego;
      stringIds = stringIds + ",";
    });
    stringIds = stringIds.slice(0, -1);

    res.status(200).json({ data: { data, stringIds }, status: 200 });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al obtener ids de tu colecccion de juegos",
      status: 400,
    });
  } finally {
    await prisma.$disconnect();
  }
};

const updateGameStore = async (req, res) => {
  const { id_juego, stock, precio } = req.body;

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
      const resultado = await prisma.$queryRawUnsafe(
        `UPDATE juegos_colecciones
            SET stock = $1, precio = $2
        WHERE id_juego = $3
            AND 
              id_coleccion = 4 RETURNING *`,
        parseInt(stock),
        parseFloat(precio),
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

export { getStoreIdsJuegosBGA, updateGameStore };
