const path = require('path');
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');
const eslint = require('gulp-eslint');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const file = require('./lib/file');

let opts;

const buildConfigs = [
  {
    babel: {
      presets: [
        ['@babel/env', {
          exclude: ['transform-regenerator'],
          targets: 'last 1 version'
        }]
      ]
    },
    name: name => path.basename(name)
  },
  {
    babel: {
      presets: [
        ['@babel/env', {
          targets: {
            ie: 11
          },
          useBuiltIns: 'usage',
          corejs: '2'
        }]
      ],
      plugins: []
    },
    name: name => `${path.basename(name, path.extname(name))}.old.js`,
    requires: [
      'custom-event-polyfill'
    ]
  }
];

module.exports = (options) => {
  opts = options;
};

module.exports.js = function js() {
  const scripts = opts.templateResources.script;
  if (!scripts) { return Promise.resolve(); }

  const jobs = [].concat(...scripts.map(res => buildConfigs.map(buildConfig => new Promise((resolve, reject) => {
    const contents = res.files.map(f => `require('./${f}');`);
    (buildConfig.requires || []).forEach(dep => contents.unshift(`require('${dep}');`));
    return browserify({
      entries: file.stream(contents.join('\n')),
      debug: true,
      transform: [babelify.configure(buildConfig.babel)]
    })
      .bundle()
      .on('error', reject)
      .pipe(source(buildConfig.name(res.name)))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(terser())
      .on('error', reject)
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(opts.dist))
      .on('finish', resolve);
  }))));

  if (opts.isWatching) {
    const allFiles = [].concat(
      ...scripts.map(l => l.files)
    ).filter((f, pos, arr) => arr.indexOf(f) === pos);

    jobs.push(new Promise(resolve => gulp.src(allFiles)
      .pipe(eslint())
      .pipe(eslint.format())
      .on('finish', resolve)));
  }

  return Promise.all(jobs);
};
