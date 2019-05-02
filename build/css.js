const path = require('path');
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const gulpPostcss = require('gulp-postcss');
const stylelint = require('gulp-stylelint');
const matchAll = require('match-all');
const file = require('./lib/file');

const P = name => require(name); // eslint-disable-line

let opts;

const processTheme = (css) => {
  const defaultVars = [];
  const schemeVars = [];

  css.walkRules(/:root.*/, (rule) => {
    const isDefaultSelector = rule.selector.indexOf('scheme-dark') === -1;
    rule.walkDecls((decl) => {
      const isVariable = decl.prop.startsWith('--');
      if (isVariable) {
        const arr = isDefaultSelector ? defaultVars : schemeVars;
        arr.push(decl);
      }
    });
    if (!isDefaultSelector) {
      rule.remove();
    }
  });

  let isRootReached;
  css.walkRules(':root', (rule) => {
    if (isRootReached) { return; }
    isRootReached = true;

    const newVars = [].concat(
      ...schemeVars,
      ...defaultVars.filter(v => !schemeVars.some(sv => sv.prop === v.prop))
    ).map(decl => decl.clone({
      prop: `${decl.prop}-scheme-dark`
    }));

    rule.append(...newVars);
  });

  css.walkRules((rule) => {
    const isSchemeRule = rule.selector.indexOf('scheme-dark') !== -1;
    const decls = [];

    rule.walkDecls((decl) => {
      const hasVariable = decl.value.indexOf('var') !== -1;
      if (hasVariable) {
        const variables = matchAll(decl.value, /\((--.+?)\)/g).toArray();
        const isSchemeVariable = variables.some(v => schemeVars.some(sv => sv.prop === v));

        if (isSchemeVariable) {
          if (isSchemeRule) {
            decl.value = decl.value.replace(')', '-scheme-dark)');
          } else {
            decls.push(decl);
          }
        }
      }
    });

    if (decls.length) {
      const newDecls = decls.map(decl => decl.clone({
        value: decl.value.replace(')', '-scheme-dark)')
      }));

      const newRule = rule.clone({
        selectors: rule.selectors.map(s => `.scheme-dark ${s}`)
      });
      rule.before(newRule);
      newRule.append(...newDecls);
    }
  });
};

const buildConfigs = [
  {
    plugins: [
      P('postcss-import'),
      P('postcss-nested'),
      P('postcss-custom-media'),
      P('postcss-extend'),
      P('autoprefixer'),
      P('cssnano')
    ],
    name: name => path.basename(name)
  },
  {
    plugins: [
      P('postcss-import'),
      P('postcss-nested'),
      P('postcss-custom-media'),
      processTheme,
      P('postcss-custom-properties')({ preserve: false }),
      P('postcss-extend'),
      P('autoprefixer'),
      P('cssnano')
    ],
    name: name => `${path.basename(name, path.extname(name))}.old.css`
  }
];

module.exports = (options) => {
  opts = options;
};

module.exports.css = function css() {
  const links = opts.templateResources.link;
  if (!links) { return Promise.resolve(); }

  const jobs = [].concat(...links.map(res => buildConfigs.map(buildConfig => new Promise((resolve, reject) => {
    const fileName = buildConfig.name(res.name);
    const entryFile = file.vinyl(fileName, './', res.files.map(f => `@import './${f}';`).join('\n'));

    return entryFile
      .pipe(sourcemaps.init())
      .pipe(gulpPostcss(buildConfig.plugins))
      .on('error', reject)
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(opts.dist))
      .on('end', resolve);
  }))));

  if (opts.isWatching) {
    const allFiles = [].concat(
      ...links.map(l => l.files)
    ).filter((f, pos, arr) => arr.indexOf(f) === pos);

    jobs.push(new Promise(resolve => gulp.src(allFiles)
      .pipe(stylelint({
        reporters: [
          { formatter: 'string', console: true }
        ],
        failAfterError: false
      }))
      .on('end', resolve)));
  }

  return Promise.all(jobs);
};
