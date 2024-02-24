const http = require('http');
const fs   = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {

    const filePath = path.join(__dirname, './audio/file.mp3');


    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('El archivo de audio no existe.');
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Archivo no encontrado');
            return;
        }


        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error('Error al obtener información del archivo.');
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Error interno del servidor');
                return;
            }

            const fileSize = stats.size;
            const range = req.headers.range;

            if (range) {
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                const chunksize = (end - start) + 1;

                res.writeHead(206, {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': 'audio/mpeg'
                });

                const stream = fs.createReadStream(filePath, { start, end });
                stream.pipe(res);
            } else {
                res.writeHead(200, {
                    'Content-Length': fileSize,
                    'Content-Type': 'audio/mpeg'
                });

                const stream = fs.createReadStream(filePath);
                stream.pipe(res);
            }
        });
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});



