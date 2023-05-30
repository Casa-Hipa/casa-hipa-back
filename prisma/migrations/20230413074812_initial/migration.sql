-- CreateTable
CREATE TABLE "dietas" (
    "id_dieta" SERIAL NOT NULL,
    "dieta" VARCHAR(50),

    CONSTRAINT "dietas_pkey" PRIMARY KEY ("id_dieta")
);

-- CreateTable
CREATE TABLE "generos" (
    "id_genero" SERIAL NOT NULL,
    "genero" VARCHAR(50),

    CONSTRAINT "generos_pkey" PRIMARY KEY ("id_genero")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "rol" VARCHAR(50),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "email" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255),
    "nombre" VARCHAR(50),
    "apellido" VARCHAR(50),
    "fecha_nacimiento" DATE,
    "genero" INTEGER,
    "ruta_foto_perfil" VARCHAR(255),
    "foto_perfil" BYTEA,
    "id_dieta" INTEGER,
    "id_rol" INTEGER,
    "estado" BOOLEAN,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("email")
);

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_genero_fkey" FOREIGN KEY ("genero") REFERENCES "generos"("id_genero") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_dieta_fkey" FOREIGN KEY ("id_dieta") REFERENCES "dietas"("id_dieta") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
