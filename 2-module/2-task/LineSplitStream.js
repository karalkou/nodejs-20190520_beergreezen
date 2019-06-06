const stream = require('stream');
const os = require('os');
// const fs = require('fs');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.tailStorage = '';
  }

  _transform(chunk, encoding, callback) {
    const tail = this.tailStorage != null ? this.tailStorage : '';
    const chunkArr = (tail + chunk.toString()).split(`${os.EOL}`);

    this.tailStorage = chunkArr.pop();

    chunkArr.forEach((chunkLine) => this.push(chunkLine));

    callback();
  }

  _flush(callback) {
    this.push(this.tailStorage);
    callback();
  }
}

// --- my LineSplitStream experimen
const lines = new LineSplitStream({encoding: 'utf-8'});

lines.on('data', (chunk) => {
  console.log('---lines data: ', chunk.toString());
});

lines.on('end', () => {
  console.log('---lines end');
});

lines.on('finish', () => {
  console.log('---lines finish');
});
lines.on('close', () => {
  console.log('---lines close');
});

// fs.createReadStream('line.txt').pipe(lines);
lines.write('нулевая');
lines.write(`первая строка${os.EOL}вторая строка${os.EOL}третья строка`);
lines.end();
// lines.destroy();


// --------------------------------------------------------

// --- my readable experiment
/* const myReadStream = fs.createReadStream('line.txt'); */

/* myReadStream.on('readable', () => {
  console.log('--myReadStream-- readable');
  let chunk = null;

  while(null !== (chunk = myReadStream.read(5))) {
      console.log('-myReadStream-- readable chunk.toString(): ', chunk.toString());
  }
}); */
/* myReadStream.on('data', (chunk) => {
  console.log('--myReadStream-- data: ', chunk.toString());
});
myReadStream.on('end', () => {
  console.log('--myReadStream-- end');
});
myReadStream.on('close', () => {
  console.log('--myReadStream close');
}); */


module.exports = LineSplitStream;
