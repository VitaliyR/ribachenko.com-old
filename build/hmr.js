const browserSync = require('browser-sync');

const server = browserSync.create();
let opts;

module.exports = (options) => {
  opts = options;
};

module.exports.serverReload = function serverReload(done) {
  server.reload();
  done();
};

module.exports.serverServe = function serverServe(done) {
  server.init({
    server: {
      baseDir: opts.dist
    },
    open: false
  });
  done();
};
