const stream = require('stream');
const Vinyl = require('vinyl');
const process = require('process');

module.exports.vinyl = (fileName, base, contents, initialName) => {
  const src = stream.Readable({ objectMode: true });
  src._read = function read() { // eslint-disable-line no-underscore-dangle
    const history = [];
    if (initialName) {
      history.push(initialName);
    }
    this.push(new Vinyl({
      cwd: process.cwd(),
      base,
      path: fileName,
      contents: contents.pipe ? contents : Buffer.from(contents),
      history
    }));
    this.push(null);
  };
  return src;
};

module.exports.stream = (contents) => {
  const s = new stream.Readable({ objectMode: true });
  s._read = () => {}; // eslint-disable-line no-underscore-dangle
  s.push(contents);
  s.push(null);
  return s;
};
