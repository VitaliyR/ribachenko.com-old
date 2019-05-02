const path = require('path');
const rimraf = require('rmfr');
const fs = require('fs-fs');
const gulp = require('gulp');
const image = require('./lib/image');

let opts;

module.exports = (options) => {
  opts = options;
};

module.exports.clean = async function clean() {
  await rimraf(opts.dist);
  await fs.mkdir(opts.dist);
  await fs.mkdir(path.join(opts.dist, 'res'));
};

module.exports.copyResources = function copyResources() {
  const dest = path.join(opts.dist, 'res');

  const stream = gulp.src(opts.res)
    .pipe(gulp.dest(dest));

  return image.process(stream)
    .pipe(gulp.dest(dest));
};

module.exports.swapDists = async function swapDists() {
  await rimraf(opts.publicDist);
  await fs.rename(opts.dist, opts.publicDist);
  opts.dist = opts.publicDist; // for watch mode
};
