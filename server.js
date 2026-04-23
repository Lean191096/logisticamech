const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Configuramos el puerto y el entorno (desarrollo)
const dev = true; // process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 8080;

// Inicializamos Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error procesando la ruta', req.url, err);
      res.statusCode = 500;
      res.end('Error interno del servidor');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`\n======================================================`);
    console.log(`> Servidor Mech Logistica Listo!`);
    console.log(`> Abre tu navegador en: http://${hostname}:${port}`);
    console.log(`======================================================\n`);
  });
}).catch((err) => {
  console.error("No se pudo iniciar el servidor:", err);
  process.exit(1);
});
