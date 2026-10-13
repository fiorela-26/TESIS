-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('SUPERADMIN', 'SUPERVISOR', 'TRABAJADOR');

-- CreateEnum
CREATE TYPE "EstadoPapeleta" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'EN_CAMPO', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "ResultadoEpp" AS ENUM ('CONFORME', 'INFRACCION');

-- CreateTable
CREATE TABLE "obras" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "obras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puntos_control" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "camaraUrl" TEXT,
    "topicMqtt" TEXT,
    "obraId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "puntos_control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "obraId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_epp" (
    "id" SERIAL NOT NULL,
    "puntoControlId" INTEGER NOT NULL,
    "resultado" "ResultadoEpp" NOT NULL,
    "eppFaltantes" TEXT[],
    "fotoUrl" TEXT,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_epp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "papeletas" (
    "id" SERIAL NOT NULL,
    "trabajadorId" INTEGER NOT NULL,
    "aprobadorId" INTEGER,
    "tarea" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "horaEstimadaRetorno" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoPapeleta" NOT NULL DEFAULT 'PENDIENTE',
    "motivoRechazo" TEXT,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaSalida" TIMESTAMP(3),
    "fechaRetorno" TIMESTAMP(3),
    "minutosEnCampo" INTEGER,

    CONSTRAINT "papeletas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "puntos_control_topicMqtt_key" ON "puntos_control"("topicMqtt");

-- CreateIndex
CREATE INDEX "puntos_control_obraId_idx" ON "puntos_control"("obraId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_obraId_idx" ON "usuarios"("obraId");

-- CreateIndex
CREATE INDEX "eventos_epp_puntoControlId_fechaHora_idx" ON "eventos_epp"("puntoControlId", "fechaHora");

-- CreateIndex
CREATE INDEX "papeletas_trabajadorId_idx" ON "papeletas"("trabajadorId");

-- CreateIndex
CREATE INDEX "papeletas_estado_idx" ON "papeletas"("estado");

-- AddForeignKey
ALTER TABLE "puntos_control" ADD CONSTRAINT "puntos_control_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "obras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "obras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_epp" ADD CONSTRAINT "eventos_epp_puntoControlId_fkey" FOREIGN KEY ("puntoControlId") REFERENCES "puntos_control"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "papeletas" ADD CONSTRAINT "papeletas_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "papeletas" ADD CONSTRAINT "papeletas_aprobadorId_fkey" FOREIGN KEY ("aprobadorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
