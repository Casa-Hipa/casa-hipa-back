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
                  nombre_juego: df.nombre_juego,
                  id_mecanica: df.id_mecanica
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


const getFacturas = async (req, res) => {
  
  try {
    const data = await prisma.facturas.findMany({
      include: {
        usuarios: {
          select: {
            email: true,
            nombre: true,
            apellido:true,
            telefono:true
          },
        },

        detallefactura: true
      },
      orderBy: {
        fecha: "desc",
      }
    });

    const facturas = data.map((factura) => {
      const {
        id,
        fecha,
        usuarios,//: { nombrecompleto: usuario },       
        detallefactura,
      } = factura;
      let total = 0
      detallefactura.forEach(element => {
        total = total + ( element.cantidad * element.precio )
      });
      // const detalles = detallefactura.map((item) => {
      //   const {
      //     id,
      //     cantidad,
      //     precio,
      //     productos: { nombre: producto },
      //   } = item;
        // return { id, cantidad, precio: parseFloat(precio), producto };
      //});
      return {
        id,
        fecha,
        usuarios,
        detallefactura,
        total
      };
    });

    res.status(200).json(facturas);
  } catch (error) {
    console.log(error)
    res.status(400).json("Error al obtener las facturas");
  } finally {
    await prisma.$disconnect();
  }
};

const getTortaMecanicas = async (req, res) => {
  
  try {

    const torta = await prisma.$queryRawUnsafe(`SELECT id_mecanica as name
    ,sum(cantidad)::int AS value
    ,sum(precio * cantidad) AS monto
  FROM detallefactura
  GROUP BY id_mecanica`)

    

    res.status(200).json(torta);
  } catch (error) {
    console.log(error)
    res.status(400).json("Error al info de mecanicas");
  } finally {
    await prisma.$disconnect();
  }
};

const getBarrasVentas = async (req, res) => {
  const { fecha_ini, fecha_fin } = req.body;
  let meses = []
  let valores = []
  try {

    const torta = await prisma.$queryRawUnsafe(`SELECT to_char(g.series, 'YYYY-MM') AS label
    ,COALESCE(SUM(df.cantidad * df.precio), 0) AS value
  FROM generate_series($1::DATE, $2::DATE, '1 month') AS g(series)
  LEFT JOIN facturas f ON to_char(f.fecha, 'YYYY-MM') = to_char(g.series, 'YYYY-MM')
  LEFT JOIN detallefactura df ON f.id = df.idfactura
  GROUP BY g.series
  ORDER BY g.series`,`${fecha_ini}`,`${fecha_fin}`)

    torta.forEach(element => {
      meses.push(element.label)
      valores.push(element.value)
    });

    res.status(200).json({meses,valores});
  } catch (error) {
    console.log(error)
    res.status(400).json("Error al info de mecanicas");
  } finally {
    await prisma.$disconnect();
  }
};
const getTortaEdades = async (req, res) => {
  
  try {

    const torta = await prisma.$queryRawUnsafe(`SELECT CASE 
		WHEN extract(year FROM age(u.fecha_nacimiento)) >= 8
			AND extract(year FROM age(u.fecha_nacimiento)) <= 15
			THEN 'Entre 8 y 15 años'
		WHEN extract(year FROM age(u.fecha_nacimiento)) > 15
			AND extract(year FROM age(u.fecha_nacimiento)) <= 25
			THEN 'Entre 16 y 25 años'
		WHEN extract(year FROM age(u.fecha_nacimiento)) > 25
			AND extract(year FROM age(u.fecha_nacimiento)) <= 40
			THEN 'Entre 26 y 40 años'
		WHEN extract(year FROM age(u.fecha_nacimiento)) > 40
			AND extract(year FROM age(u.fecha_nacimiento)) <= 60
			THEN 'Entre 41 y 60 años'
		WHEN extract(year FROM age(u.fecha_nacimiento)) > 60
			THEN 'Mayor de 60 años'
		END AS name
	,count(*)::int as value
	,sum(e.precio) AS monto
FROM usuarios u
INNER JOIN eventos_usuarios eu ON eu.email_usuario = u.email
INNER JOIN eventos e ON e.id_evento = eu.id_evento
WHERE u.fecha_nacimiento IS NOT NULL
GROUP BY 1`)

    

    res.status(200).json(torta);
  } catch (error) {
    console.log(error)
    res.status(400).json("Error al info de edades");
  } finally {
    await prisma.$disconnect();
  }
};

const getAsistenciasEventos = async (req, res) => {
  
  try {
    const data = await prisma.eventos.findMany({
      // select:{
      //   fecha_inicio:true,
      //   titulo:true,
      //   precio:true,
      //   limite_asistentes:true,
      // },      
      include: {

        eventos_usuarios:{       
   
          include:{
            usuarios:{
              select:{
                nombre:true,
                apellido:true,
                email:true,
                fecha_nacimiento:true
              }
            }
          }     } 
        

      }
      ,
      orderBy:{
        fecha_inicio: 'desc'
      }

    });

    const facturas = data.map((factura) => {
      const {
        id_evento,
        titulo,
        fecha_inicio,
        precio,
        limite_asistentes,        
        eventos_usuarios,
      } = factura;
      let asistentes = 0
      eventos_usuarios.forEach(element => {
        asistentes = asistentes + 1
      });
      let porcentajeAsistentes = 0
      porcentajeAsistentes = (asistentes / limite_asistentes) * 100
      return {
        id_evento,
        titulo,
        fecha_inicio,  
        precio,
        limite_asistentes, 
        asistentes,    
        porcentajeAsistentes,  
        eventos_usuarios,
        
      };
    });

    res.status(200).json(facturas);
  } catch (error) {
    console.log(error)
    res.status(400).json("Error al obtener las asistencias");
  } finally {
    await prisma.$disconnect();
  }
};

const getChartAreaAsistencias = async (req, res) => {
  const { fecha_ini, fecha_fin } = req.body;
  let meses = []
  let valores = []
  try {

    const torta = await prisma.$queryRawUnsafe(`SELECT to_char(g.series, 'Month') AS month
    ,COALESCE(SUM(precio), 0) AS value
  FROM generate_series($1::DATE, $2::DATE, '1 month') AS g(series)
  LEFT JOIN eventos f ON to_char(f.fecha_inicio, 'YYYY-MM') = to_char(g.series, 'YYYY-MM')
  LEFT JOIN eventos_usuarios eu ON f.id_evento = eu.id_evento
  GROUP BY g.series
  ORDER BY g.series`,`${fecha_ini}`,`${fecha_fin}`)

    torta.forEach(element => {
      meses.push(element.month)
      valores.push(element.value)
    });

    res.status(200).json({meses,valores});
  } catch (error) {
    console.log(error)
    res.status(400).json("Error al info de mecanicas");
  } finally {
    await prisma.$disconnect();
  }
};
export { getChartAreaAsistencias,getStoreIdsJuegosBGA, updateGameStore, createFactura, getFacturas, getTortaMecanicas,getTortaEdades, getBarrasVentas , getAsistenciasEventos};
