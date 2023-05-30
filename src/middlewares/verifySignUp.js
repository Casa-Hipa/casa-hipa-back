const checkDuplicateEmail = (req, res, next) => {
  // Username
  prisma.usuarios
    .findUnique({
      where: {
        email: req.body.email,
      },
    })
    .then((usuario) => {
      if (usuario) {
        res.status(400).send({
          mensaje: "El usuario ya existe",
        });
        return;
      }
    });

  next();
};

export { checkDuplicateEmail };
