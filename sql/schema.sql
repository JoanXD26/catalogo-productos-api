CREATE TABLE usuarios (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    correo VARCHAR(254) NOT NULL,
    contrasena_hash TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'usuario',
    CONSTRAINT usuarios_nombre_valido CHECK (nombre ~ '[^[:space:]]'),
    CONSTRAINT usuarios_correo_unico UNIQUE (correo),
    CONSTRAINT usuarios_correo_normalizado CHECK (
        correo <> '' AND correo = lower(btrim(correo))
    ),
    CONSTRAINT usuarios_hash_valido CHECK (contrasena_hash ~ '[^[:space:]]'),
    CONSTRAINT usuarios_rol_valido CHECK (rol IN ('usuario', 'administrador'))
);

CREATE TABLE productos (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    precio NUMERIC(12, 2) NOT NULL,
    CONSTRAINT productos_nombre_valido CHECK (nombre ~ '[^[:space:]]'),
    CONSTRAINT productos_descripcion_valida CHECK (descripcion ~ '[^[:space:]]'),
    CONSTRAINT productos_categoria_valida CHECK (categoria ~ '[^[:space:]]'),
    CONSTRAINT productos_precio_valido CHECK (precio > 0 AND precio <> 'NaN'::numeric)
);

CREATE TABLE favoritos (
    usuario_id INTEGER,
    producto_id INTEGER,
    CONSTRAINT favoritos_pk PRIMARY KEY (usuario_id, producto_id),
    CONSTRAINT favoritos_usuario_fk FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id) ON DELETE CASCADE,
    CONSTRAINT favoritos_producto_fk FOREIGN KEY (producto_id)
        REFERENCES productos (id) ON DELETE CASCADE
);

CREATE INDEX favoritos_producto_id_idx ON favoritos (producto_id);