const url = require('url');
const http = require('http');
const path = require('path');

const server = http.createServer();

server.on('request', (req, res) => {
  req.on('error', (err) => {
    console.log('server request error: ', err);
  });

  res.on('error', (err) => {
    console.log('server response error: ', err);
  });

  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'GET': {
      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.statusMessage = 'Server doesn\'t support nested paths';
        res.end();
      }


      const readStream = fs.createReadStream(filepath);

      readStream.on('error', (error) => {
        if (error.code === 'ENOENT') {
          res.statusCode = 404;
          res.statusMessage = 'File doesn\'t exist';
          res.end();
        } else {
          res.statusCode = 500;
          res.statusMessage = 'Internal server error';
          res.end();
        }
      });

      readStream.pipe(res);

      res.on('close', () => {
        if (res.finished) return;
        readStream.destroy();
      });

      break;
    }

    default: {
      res.statusCode = 501;
      res.statusMessage = 'Not implemented';
      res.end();
    }
  }
});

module.exports = server;
