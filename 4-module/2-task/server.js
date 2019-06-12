const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);

  if (pathname.includes('/')) {
    handleError(400, res);
  }

  switch (req.method) {
    case 'POST': {
      if (!filepath) {
        handleError(404, res);
      }

      if (req.headers['content-length'] > 1e6) {
        handleError(413, res);
      }

      const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});
      const limitStream = new LimitSizeStream({limit: 1e6});

      req
          .pipe(limitStream)
          .pipe(writeStream);

      req
          .on('aborted', () => fs.unlink(filepath, (err) => {}));

      limitStream
          .on('error', (err) => {
            if (err.code === 'LIMIT_EXCEEDED') {
              handleError(413, res, filepath);
            } else {
              handleError(500, res, filepath);
            }
          });

      writeStream
          .on('error', (err) => {
            if (err.code === 'EEXIST') {
              handleError(409, res);
            } else {
              handleError(500, res);
            }
          })
          .on('close', () => {
            handleError(201, res);
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


  function handleError(errorCode, res, filepath = null) {
    switch (errorCode) {
      case 201:
        res.statusCode = 201;
        res.end();
        break;
      case 400:
        res.statusCode = 400;
        res.end('Server doesn\'t support nested paths');
        break;
      case 404:
        res.statusCode = 404;
        res.end('File not found');
        break;
      case 409:
        res.statusCode = 409;
        res.end('File is already exist');
        break;
      case 413:
        res.statusCode = 413;
        res.end('Limit is exceeded!');
        break;
      case 500:
        res.statusCode = 500;
        res.end('Internal server error');
        break;
    }
    if (filepath) {
      fs.unlink(filepath, () => {
      });
    }
  }
});

module.exports = server;
