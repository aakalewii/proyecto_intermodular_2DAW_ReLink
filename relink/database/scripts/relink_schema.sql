use relink;

-- Por si quieres borrar y recrear
DROP TABLE IF EXISTS mensajes;
DROP TABLE IF EXISTS conversaciones;
DROP TABLE IF EXISTS imagenes_anuncio;
DROP TABLE IF EXISTS anuncios;
DROP TABLE IF EXISTS ubicaciones;
DROP TABLE IF EXISTS subcategorias;
DROP TABLE IF EXISTS categorias;

-- 1) CATEGORIAS
CREATE TABLE categorias (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

-- 2) SUBCATEGORIAS
CREATE TABLE subcategorias (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  categoria_id BIGINT UNSIGNED NOT NULL,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- 3) UBICACIONES
CREATE TABLE ubicaciones (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ciudad VARCHAR(100) NOT NULL,
  provincia VARCHAR(100) NOT NULL,
  pais VARCHAR(100) NOT NULL
);

-- 4) ANUNCIOS
CREATE TABLE anuncios (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(120) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'publicado',
  fecha_publi DATETIME NULL,

  user_id BIGINT UNSIGNED NOT NULL,
  subcategoria_id BIGINT UNSIGNED NOT NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subcategoria_id) REFERENCES subcategorias(id)
);

-- 5) IMAGENES DEL ANUNCIO
CREATE TABLE imagenes_anuncio (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  anuncio_id BIGINT UNSIGNED NOT NULL,
  url VARCHAR(255) NOT NULL,
  orden INT NOT NULL DEFAULT 0,
  FOREIGN KEY (anuncio_id) REFERENCES anuncios(id) ON DELETE CASCADE
);

-- 6) CONVERSACIONES
CREATE TABLE conversaciones (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  anuncio_id BIGINT UNSIGNED NOT NULL,
  vendedor_id BIGINT UNSIGNED NOT NULL,
  comprador_id BIGINT UNSIGNED NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'activa',

  FOREIGN KEY (anuncio_id) REFERENCES anuncios(id) ON DELETE CASCADE,
  FOREIGN KEY (vendedor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (comprador_id) REFERENCES users(id) ON DELETE CASCADE,

  -- Evita que un comprador abra 2 chats por el mismo anuncio
  UNIQUE (anuncio_id, comprador_id)
);

-- 7) MENSAJES
CREATE TABLE mensajes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversacion_id BIGINT UNSIGNED NOT NULL,
  remitente_id BIGINT UNSIGNED NOT NULL,
  contenido TEXT NOT NULL,
  fecha_envio DATETIME NULL,

  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (remitente_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE users
  ADD apellidos VARCHAR(100) NULL,
  ADD telefono VARCHAR(30) NULL,
  ADD rol VARCHAR(20) NOT NULL DEFAULT 'cliente',
  ADD activo TINYINT(1) NOT NULL DEFAULT 1;

-- Añadir timestamps ya que no los añadimos en el primer script

ALTER TABLE categorias
  ADD created_at TIMESTAMP NULL DEFAULT NULL,
  ADD updated_at TIMESTAMP NULL DEFAULT NULL;

ALTER TABLE subcategorias
  ADD created_at TIMESTAMP NULL DEFAULT NULL,
  ADD updated_at TIMESTAMP NULL DEFAULT NULL;

ALTER TABLE ubicaciones
  ADD created_at TIMESTAMP NULL DEFAULT NULL,
  ADD updated_at TIMESTAMP NULL DEFAULT NULL;

ALTER TABLE anuncios
  ADD created_at TIMESTAMP NULL DEFAULT NULL,
  ADD updated_at TIMESTAMP NULL DEFAULT NULL;

ALTER TABLE imagenes_anuncio
  ADD created_at TIMESTAMP NULL DEFAULT NULL,
  ADD updated_at TIMESTAMP NULL DEFAULT NULL;

ALTER TABLE conversaciones
  ADD created_at TIMESTAMP NULL DEFAULT NULL,
  ADD updated_at TIMESTAMP NULL DEFAULT NULL;

ALTER TABLE mensajes
  ADD created_at TIMESTAMP NULL DEFAULT NULL,
  ADD updated_at TIMESTAMP NULL DEFAULT NULL;

-- Añadir descripcion a categoria y subcategoria

ALTER TABLE categorias
	ADD descripcion varchar(200) null;

ALTER TABLE subcategorias
	ADD descripcion varchar(200) null;

ALTER TABLE users
MODIFY COLUMN rol ENUM('cliente', 'pro', 'admin') NOT NULL DEFAULT 'cliente';

ALTER TABLE users
ADD COLUMN `online` BOOLEAN DEFAULT 0;

CREATE TABLE paises (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL
);

CREATE TABLE provincias (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    pais_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
    FOREIGN KEY (pais_id) REFERENCES paises(id) ON DELETE CASCADE
);

CREATE TABLE municipios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    provincia_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
    FOREIGN KEY (provincia_id) REFERENCES provincias(id) ON DELETE CASCADE
);

CREATE TABLE localidades (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    municipio_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
    FOREIGN KEY (municipio_id) REFERENCES municipios(id) ON DELETE CASCADE
);

ALTER TABLE anuncios
ADD COLUMN localidad_id BIGINT UNSIGNED NOT NULL,
ADD CONSTRAINT fk_anuncio_localidad
    FOREIGN KEY (localidad_id) REFERENCES localidades(id)
    ON DELETE RESTRICT;

ALTER TABLE users
ADD COLUMN localidad_id BIGINT UNSIGNED NULL,
ADD CONSTRAINT fk_user_localidad
    FOREIGN KEY (localidad_id) REFERENCES localidades(id)
    ON DELETE SET NULL;

    CREATE TABLE favoritos (
    user_id BIGINT UNSIGNED NOT NULL,
    anuncio_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    PRIMARY KEY (user_id, anuncio_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (anuncio_id) REFERENCES anuncios(id) ON DELETE CASCADE
);

ALTER TABLE mensajes
ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'enviado';



/* ME ACABO DE DAR CUENTA QUE HICE LA DESCRIPCION DE CAT Y SUBCAT OBLIGATORIAS Y N0 TIENE
MUCHO SENTIDO. EJECUTEN ESTO:

use relink;

ALTER TABLE categorias
MODIFY descripcion varchar(200) NULL;

ALTER TABLE subcategorias
MODIFY descripcion varchar(200) NULL; */


--Hacer que los anuncios puedan tener localidad null--
-- 1. Borramos la regla estricta actual
ALTER TABLE anuncios DROP FOREIGN KEY fk_anuncio_localidad;

-- 2. Permitimos que la columna acepte nulos (Asegúrate de que el tipo de dato coincide, normalmente es BIGINT UNSIGNED)
ALTER TABLE anuncios MODIFY localidad_id BIGINT UNSIGNED NULL;

-- 3. Creamos la nueva regla con "ON DELETE SET NULL"
ALTER TABLE anuncios ADD CONSTRAINT fk_anuncio_localidad
FOREIGN KEY (localidad_id) REFERENCES localidades(id) ON DELETE SET NULL;
