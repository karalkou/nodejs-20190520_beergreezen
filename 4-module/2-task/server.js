const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

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
    case 'POST': {
      if (pathname.includes('/')) {
        res.statusCode = 400;
        res.statusMessage = 'Server doesn\'t support nested paths';
        res.end();
      }

      const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});
      const limitStream = new LimitSizeStream({limit: 1000000});

      req
          .pipe(limitStream)
          .on('error', (err) => {
            if (err.code === 'LIMIT_EXCEEDED') {
              res.statusCode = 413;
              res.statusMessage = 'Limit is exceeded!';

              fs.unlink(filepath, (err) => {});

              res.end();
            }
          })
          .pipe(writeStream)
          .on('error', (err) => {
            if (err.code === 'EEXIST') {
              res.statusCode = 409;
              res.statusMessage = 'File already exists!';
              res.end();
            } else {
              res.statusCode = 500;
              res.statusMessage = 'Internal server error';
              res.end();
            }
          })
          .on('close', () => {
            res.statusCode = 201;
            res.statusMessage = 'Successfully created';
            res.end();
          });

      // remove file from disc if writing was interrupted
      res
          .on('close', () => {
            if (res.finished) {
              return null;
            }

            fs.unlink(filepath, (err) => {});
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
