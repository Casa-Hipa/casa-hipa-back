console.log("bgg works");

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import axios from "axios";
import xml2js from "xml2js";
var idx = 220001;
var urlbase = "https://api.geekdo.com/xmlapi/boardgame/";

const insertJuego = async (result) => {
  result.boardgames.boardgame.forEach(async (element) => {
    const {
      $: id,
      age,
      yearpublished,
      minplayers,
      maxplayers,
      playingtime,
      name,
      description,
      thumbnail,
      image,
      boardgamepublisher,
      boardgamehonor,
      boardgamemechanic,
      boardgamecategory,
    } = element;
    if (!id) {
      console.log(`no hay juego para el id`);
      return;
    }
    try {
      const myData = await prisma.juegos.create({
        data: {
          id: id.objectid,
          age: age?.[0],
          yearpublished: yearpublished?.[0],
          minplayers: minplayers?.[0],
          maxplayers: maxplayers?.[0],
          playingtime: playingtime?.[0],
          name: name?.[0]._,
          description: description?.[0],
          thumbnail: thumbnail?.[0],
          image: image?.[0],
          boardgamepublisher: boardgamepublisher?.[0]._,
          boardgamehonor: boardgamehonor?.[0]._,
          boardgamemechanic: boardgamemechanic?.[0]._,
          boardgamecategory: boardgamecategory?.[0]._,
        },
      });
      console.log(`juego id: ${id.objectid} insertado`);
    } catch (error) {
      console.log("no se pudo insertar el juego id: ");
      //console.log(JSON.stringify(result));
    }
  });
};

const getData = async (idx) => {
  try {
    const response = await axios.get(`${urlbase}`);
    const xmlResponse = response.data;
    xml2js.parseString(xmlResponse, (err, result) => {
      if (err) {
        console.error("no se pudo parsear");
      } else {
        insertJuego(result);
      }
    });
  } catch (error) {
    console.error("no se encontró el id: " + idx);
    // console.log(urlbase);
  }
};

while (idx <= 230000) {
  if (idx % 1000 !== 0) {
    urlbase = urlbase + idx + ",";
  } else {
    urlbase = urlbase + idx;
    console.log(urlbase);
    getData();

    urlbase = "https://api.geekdo.com/xmlapi/boardgame/";
  }

  idx++;
}
//38620 max
