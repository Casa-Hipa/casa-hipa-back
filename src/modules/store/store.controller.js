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

const createFactura = async (req, res) => {
  // const token = req.header("x-access-token");
  // const tokenDecoded = jwt.verify(token, process.env.SECRET);
  // const { id } = tokenDecoded;

  const {email_usuario, detalles } =
    req.body;
  try {
    // const ultimaFactura = await prisma.facturas.findFirst({
    //   select: {
    //     fecha: true,
    //   },
    //   orderBy: {
    //     id: "desc",
    //   },
    // });

    const fechaNuevaFactura = new Date(); // fecha de la nueva factura
    // if(ultimaFactura) {
    //   const fechaUltimaFactura = new Date(ultimaFactura.fecha); // fecha de la última factura
    //   if (fechaUltimaFactura > fechaNuevaFactura) {
    //     return res
    //       .status(400)
    //       .json(
    //         "La fecha de la factura no puede ser menor a la fecha de la última factura"
    //       );
    //   }
    // }


    const data = await prisma.facturas.create({
      data: {
        fecha: fechaNuevaFactura,        
        email_cliente:email_usuario, // id del cliente que está comprando       
        // descuento: parseFloat(descuento), // descuento de la factura
        estado: true,
        detallefactura: {
          createMany: {
            data: detalles.map(
              (df) =>
                (df = {
                  cantidad: parseInt(df.cantidad),
                  precio: parseFloat(df.precio),
                  id_juego: df.id_juego,
                })
            ),
          },
        },
      },
    });

    if (data) {
      await prisma.$transaction(
        detalles.map((item) => {
          const { id_juego, cantidad } = item;
          return prisma.juegos_colecciones.updateMany({
            where: {
              id_juego: id_juego,
              id_coleccion: 4 // id del store
            },
            data: {
              stock: {
                decrement: parseInt(cantidad),
              },
            },
          });
        })
      );
    }

    // #region Pagos con Mercado Pago
    
    // if (parseInt(idTipoPago) === 2) {
      
    //   const preference = crearPreferencia(req, data.id);
    //   const mp = await mercadoPago.preferences.create(preference);

    //   return res.json(mp.body.init_point);
    // }

    res.status(200).json(data); // id de la factura creada
  } catch (error) {
    console.log(error);
    res.status(400).json("Error al crear la factura");
  } finally {
    await prisma.$disconnect();
  }
};

export { getStoreIdsJuegosBGA, updateGameStore, createFactura };
