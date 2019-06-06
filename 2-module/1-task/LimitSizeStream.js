const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.limit = options.limit;
    this.passedBytes = 0;
  }

  _transform(chunk, encoding, callback) {
    this.passedBytes += Buffer.byteLength(chunk);

    if (this.passedBytes > this.limit) {
      callback(new LimitExceededError());
    }

    callback(null, chunk);
  }
}

module.exports = LimitSizeStream;
