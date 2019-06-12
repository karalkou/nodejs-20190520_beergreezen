const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE': {
      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.statusMessage = 'Server doesn\'t support nested paths';
        res.end();
      }

      fs.unlink(filepath, (err) => {
        if (err) {
          switch (err.code) {
            case 'ENOENT': {
              res.statusCode = 404;
              res.end();
              break;
            }
            default: {
              res.statusCode = 500;
              res.end();
            }
          }
        }

        res.statusCode = 200;
        res.statusMessage = 'Ok';
        res.end();
      });
      break;
    }
    default: {
      res.statusCode = 501;
      res.end('Not implemented');
    }
  }
});

module.exports = server;
