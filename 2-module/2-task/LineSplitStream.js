const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.tailStorage = '';
  }

  _transform(chunk, encoding, callback) {
    const tail = this.tailStorage != null ? this.tailStorage : '';
    const chunkArr = (tail + chunk.toString()).split(`${os.EOL}`);

    /**
    * The last array item (data after the last completed line with os.EOL)
    * is removed with Array.pop() and stored for future
    */
    this.tailStorage = chunkArr.pop();

    /* Push each chunkLine separately */
    chunkArr.forEach((chunkLine) => this.push(chunkLine));

    callback();
  }

  _flush(callback) {
    this.push(this.tailStorage);
    callback();
  }
}

module.exports = LineSplitStream;
