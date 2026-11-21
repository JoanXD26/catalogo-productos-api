# Catálogo de productos API

**Autor** · Joan Rodriguez ([JoanXD26](https://github.com/JoanXD26))

Desarrollé esta API REST para administrar un catálogo y guardar los favoritos de cada usuario. El catálogo se puede consultar sin iniciar sesión. Un administrador puede crear, actualizar y eliminar productos. Cualquier usuario autenticado puede gestionar sus propios favoritos.

## Tecnologías y modelo de datos

Usé Node.js 24, Express 5, PostgreSQL 18 y el cliente `pg`. `dotenv` carga la configuración local, `bcrypt` genera los hashes de las contraseñas y `jsonwebtoken` firma y verifica los JWT. Usé Git y GitHub para versionar el proyecto, y Postman para probar la API.

Elegí PostgreSQL porque un favorito relaciona dos entidades. La clave primaria compuesta de `favoritos` impide repetir la misma pareja de usuario y producto. Las claves foráneas exigen que ambos registros existan. Al borrar un producto, PostgreSQL elimina sus favoritos mediante `ON DELETE CASCADE`.

```text
src/
  server.js        Arranque de Node.js en 127.0.0.1
  app.js           Express y rutas principales
  config/          Pool de PostgreSQL y configuración JWT
  routes/          Rutas de autenticación, productos y favoritos
  controllers/    Respuestas y lógica de las peticiones
  data/            Consultas SQL parametrizadas
  middlewares/     Validación, autenticación, roles y errores
  seguridad/       Validación de credenciales y bcrypt
scripts/           Comprobación de la base y creación del administrador
sql/               Esquema y cinco productos de ejemplo
postman/           Colección, entorno de ejemplo y tabla de pruebas
```

## Requisitos e instalación en Windows

Necesitas Git, Node.js 24 con npm, PostgreSQL 18 con `psql` y Postman de escritorio. Ejecuta los comandos en PowerShell.

```powershell
git clone https://github.com/JoanXD26/catalogo-productos-api.git
Set-Location .\catalogo-productos-api
npm.cmd ci
Copy-Item .\.env.example .\.env
```

## Configuración local

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto de la API. Valor de ejemplo `3000`. |
| `PGHOST` | Servidor de PostgreSQL. Valor de ejemplo `127.0.0.1`. |
| `PGPORT` | Puerto de PostgreSQL. Valor de ejemplo `5432`. |
| `PGDATABASE` | Base de datos. Valor de ejemplo `catalogo_productos`. |
| `PGUSER` | Usuario de conexión. Valor de ejemplo `catalogo_app`. |
| `PGPASSWORD` | Contraseña del usuario de PostgreSQL. |
| `JWT_SECRET` | Secreto aleatorio de 32 bytes, escrito como 64 caracteres hexadecimales. |
| `JWT_TTL_SECONDS` | Vigencia del JWT en segundos. Por defecto `3600`, con un rango de `1` a `86400`. |

Genera la clave JWT desde la raíz del proyecto. Si tienes `.env` abierto en el editor, ciérralo antes de ejecutar este bloque.

```powershell
$claveJwt = node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))"
$rutaEnv = (Resolve-Path -LiteralPath .\.env).Path
$contenidoEnv = [IO.File]::ReadAllText($rutaEnv)
$contenidoEnv = $contenidoEnv -replace '(?m)^JWT_SECRET=[^\r\n]*', "JWT_SECRET=$claveJwt"
[IO.File]::WriteAllText($rutaEnv, $contenidoEnv)
Remove-Variable claveJwt, contenidoEnv
```

Guarda la contraseña de PostgreSQL y la clave JWT únicamente en `.env`. En `.env.example` ambos valores quedan vacíos.

## Inicialización de PostgreSQL

Abre `psql` con el usuario `postgres`. Ajusta la ruta del ejecutable y el puerto si tu instalación usa otros valores.

```powershell
$psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'
& $psql -X -h 127.0.0.1 -p 5432 -U postgres -d postgres -W
```

En `psql`, ejecuta `CREATE ROLE catalogo_app LOGIN;` y después `\password catalogo_app`. Este último comando te pide una contraseña nueva dos veces. Si el rol ya existe, puedes reutilizarlo y usar su contraseña en `.env`.

Cuando vuelva el prompt, ejecuta lo siguiente.

```sql
CREATE DATABASE catalogo_productos OWNER catalogo_app;
\connect catalogo_productos
GRANT USAGE, CREATE ON SCHEMA public TO catalogo_app;
\q
```

Escribe en `PGPASSWORD` de tu `.env` la contraseña de `catalogo_app`. Desde PowerShell, aplica el esquema y carga los cinco productos ficticios en una transacción.

```powershell
& $psql -X -h 127.0.0.1 -p 5432 -U catalogo_app -d catalogo_productos -W -v ON_ERROR_STOP=1 --single-transaction -f .\sql\schema.sql -f .\sql\seed.sql
npm.cmd run db:check
```

En una base nueva, la carga devuelve `INSERT 0 5`. `db:check` muestra la base, el usuario y hasta cinco productos. Para probar una segunda instalación, crea otra base y usa su nombre en `CREATE DATABASE`, en `\connect`, en `-d` al cargar los scripts y en `PGDATABASE`.

## Administrador y arranque

Crea el administrador con el script local. La contraseña debe tener al menos 12 caracteres y hasta 72 bytes. El script informa si el correo ya está registrado.

```powershell
$claveAdmin = Read-Host 'Contraseña del administrador de la API' -AsSecureString
try {
    $env:ADMIN_CONTRASENA = [System.Net.NetworkCredential]::new('', $claveAdmin).Password
    npm.cmd run admin:create -- "Administrador de pruebas" "admin.catalogo@example.test"
} finally {
    Remove-Item Env:ADMIN_CONTRASENA -ErrorAction SilentlyContinue
    Remove-Variable claveAdmin -ErrorAction SilentlyContinue
}

npm.cmd start
```

Con el servidor en marcha, prueba desde otra terminal.

```powershell
curl.exe -i http://127.0.0.1:3000/health
curl.exe -i http://127.0.0.1:3000/productos
```

`/health` comprueba que Node.js responde. `/productos` comprueba que la API también puede leer PostgreSQL. Usa el puerto que muestra la terminal al arrancar.

## Endpoints

En las rutas protegidas, envía `Authorization: Bearer <JWT>`. Para las peticiones con cuerpo, usa `Content-Type: application/json`.

| Método y ruta | Acceso | Petición o propósito | Éxito |
| --- | --- | --- | --- |
| `GET /health` | Público | Verificar el proceso de la API | `200` |
| `POST /auth/registro` | Público | `nombre`, `correo` y `contrasena`. Crea el rol `usuario`. | `201` |
| `POST /auth/login` | Público | `correo` y `contrasena`. Devuelve `data.usuario` y `data.token`. | `200` |
| `GET /productos` | Público | Listar. Acepta `?categoria=electronica` para filtrar por categoría exacta. | `200` |
| `GET /productos/:id` | Público | Consultar un producto | `200` |
| `POST /productos` | Administrador | Crear con `nombre`, `descripcion`, `categoria` y `precio` | `201` |
| `PUT /productos/:id` | Administrador | Actualizar con los cuatro campos del producto | `200` |
| `DELETE /productos/:id` | Administrador | Eliminar un producto y sus favoritos asociados | `200` |
| `GET /favoritos` | JWT válido | Listar los productos favoritos de la cuenta autenticada | `200` |
| `POST /favoritos` | JWT válido | Agregar el `productoId` indicado a la cuenta autenticada | `201` |
| `DELETE /favoritos/:productoId` | JWT válido | Retirar el producto de los favoritos de esa cuenta | `200` |

Los errores tienen la forma `{"error":{"message":"..."}}`. La API usa `400` para datos inválidos, `401` para credenciales incorrectas o un JWT ausente, inválido o vencido y `403` para un rol sin permiso. Usa `404` cuando el recurso solicitado no existe y `409` para un correo o favorito duplicado. Devuelve `413` si el cuerpo excede el tamaño permitido y `415` si la codificación no es compatible. Un fallo interno responde `500` con un mensaje genérico.

### Ejemplos de peticiones

Para `POST /auth/registro`, usa un correo ficticio y reemplaza `contrasena` por una clave local de prueba. Para `POST /auth/login`, envía `correo` y `contrasena` del mismo usuario.

```json
{
  "nombre": "Usuario de prueba",
  "correo": "usuario.demo@example.test",
  "contrasena": "<clave-ficticia-local>"
}
```

Para `POST /productos` o `PUT /productos/:id`, usa el JWT de administrador. Envía `precio` como número JSON. La respuesta lo devuelve como texto decimal, por ejemplo `"19.90"`, tal como lo entrega `pg` para `NUMERIC`.

```json
{
  "nombre": "Soporte de escritorio",
  "descripcion": "Soporte ajustable de ejemplo.",
  "categoria": "oficina",
  "precio": 19.90
}
```

Para `POST /favoritos`, usa el JWT de la cuenta que guarda el favorito y reemplaza `1` por un ID existente obtenido de `GET /productos`.

```json
{
  "productoId": 1
}
```

## Pruebas en Postman

1. Con Node.js y PostgreSQL en marcha, importa la [colección](postman/catalogo-api.postman_collection.json) y el [entorno de ejemplo](postman/catalogo-local.example.postman_environment.json).
2. Selecciona **Catálogo API · Local de ejemplo**. Ajusta `baseUrl` al puerto de la API. Completa `adminCorreo` y `adminContrasena` como valores locales de Postman.
3. Abre la colección con **Run**, selecciona una iteración y activa **Keep variable values**. Desmarca las seis peticiones `[Manual]`. El recorrido automático tiene 41 peticiones y 82 aserciones. Genera dos cuentas ficticias e IDs nuevos en cada ejecución.
4. **CP-25.** Deja PostgreSQL en marcha. Detén Node.js con `Ctrl+C`, arráncalo con `npm.cmd start` y envía `CP-25c` y `CP-25d`. Ambas deben devolver `200` para el producto y su favorito. Ejecuta `CP-25e` para retirar el producto temporal.
5. **CP-16.** Detén Node.js y arráncalo temporalmente con los comandos siguientes. Envía `CP-16a` y luego `CP-16b` enseguida para ver `200`. Pasados 35 segundos desde `CP-16a`, envía `CP-16c` y espera `401` con el mismo JWT.

```powershell
$env:JWT_TTL_SECONDS = '30'
npm.cmd start
```

Al terminar, detén Node.js con `Ctrl+C`, ejecuta `Remove-Item Env:JWT_TTL_SECONDS` en la misma terminal y vuelve a arrancar con `npm.cmd start`. La [tabla de pruebas](postman/tabla-pruebas.csv) registra los 27 casos. Para compartir el entorno, usa el JSON de ejemplo del repositorio con sus valores sensibles vacíos.
