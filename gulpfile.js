const gulp = require('gulp');
const path = require('path');

require('dotenv').config();

const options = {
  prodUrl: 'https://ribachenko.com/',
  dist: './dist2',
  publicDist: './dist',
  src: './src',
  pugConfig: './src/pug.config.js',
  html: ['./src/index.pug', './src/cv/index.pug', './src/wishlist/index.pug'],
  rss: './src/rss/index.pug',
  posts: './posts',
  placesJson: './places.json',
  res: ['./src/res/**/*', '!./src/res/icons/**/*'],
  templateResources: {},
  pdf: [
    {
      url: 'https://ribachenko.com/cv/',
      file: 'cv.pdf'
    }
  ]
};

const tasks = require('./build/')(options);

const resources = gulp.parallel(tasks.copyResources, tasks.maps, tasks.posts);
const cssJs = gulp.parallel(tasks.css, tasks.js);
const buildAll = gulp.series(tasks.clean, resources, tasks.rss, tasks.html, cssJs, tasks.swapDists);

const watch = () => {
  options.isWatching = true;
  const htmlPaths = [].concat(
    path.join(options.src, '**/*.pug'),
    options.pugConfig,
    `!${options.rss}`,
    './src/res/icons/**/*.svg'
  );
  gulp.watch(htmlPaths, gulp.series(tasks.html, cssJs, tasks.serverReload));
  gulp.watch(path.join(options.src, '**/*.css'), gulp.series(tasks.css, tasks.serverReload));
  gulp.watch(path.join(options.src, '**/*.js'), gulp.series(tasks.js, tasks.serverReload));
  gulp.watch(options.rss, gulp.series(tasks.rss, tasks.serverReload));
  gulp.watch(options.res, gulp.series(tasks.copyResources, tasks.serverReload));
};

module.exports.default = gulp.series(buildAll, tasks.pdf);
module.exports.watch = gulp.series(buildAll, tasks.serverServe, watch);
module.exports.pdf = tasks.pdf;
