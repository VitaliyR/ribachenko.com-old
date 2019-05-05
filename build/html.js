const path = require('path');
const gulp = require('gulp');
const pug = require('gulp-pug');
const embedSvg = require('gulp-embed-svg');
const posthtml = require('gulp-posthtml');
const posthtmlRender = require('posthtml-render');
const rename = require('gulp-rename');
const mergeStream = require('merge-stream');
const terser = require('terser');
const fs = require('fs-fs');
const Svgo = require('svgo');
const file = require('./lib/file');
const pugConfigFactory = require('../src/pug.config');

let opts = {};
let processedTemplates = [];

const spriteClass = 'o-svg-sprite';

const svgo = new Svgo({
  plugins: [
    { removeUselessDefs: false },
    { cleanupIDs: false }
  ]
});

const resolve = (src, base) => {
  if (!src || src.startsWith('http')) {
    return null;
  }
  if (src[0] === '/') {
    const firstDir = src.split(path.sep)[1];
    if (firstDir !== path.normalize(opts.src)) {
      src = path.join(opts.src, src);
    }
  } else {
    src = path.relative('./', path.join(base, src));
  }
  return src;
};

const getSrc = (node) => {
  const tag = node.tag || '';
  const attrs = node.attrs || {};

  switch (tag.toLowerCase()) {
    case 'link': return attrs.rel === 'stylesheet' && attrs.href;
    default: return attrs.src;
  }
};

const cssTagTemplate = src => `
var isSupportVariables = window.CSS && CSS.supports('color', 'var(--var)');
var href = isSupportVariables ? '${src}' : '${src.replace('.css', '.old.css')}';
var currentScript = document.scripts[document.scripts.length - 1];
var styleNode = document.createElement('link');
styleNode.setAttribute('rel', 'stylesheet');
styleNode.setAttribute('href', href);
currentScript.parentElement.append(styleNode);
`;

const getResourceName = (templateName, tag) => {
  let ext = '.js';
  if (tag === 'link') {
    ext = '.css';
  }
  return `/${templateName.replace(path.extname(templateName), ext)}`;
};

const appendNode = (baseNode, tag, res, templateRes) => {
  switch (tag.toLowerCase()) {
    case 'script':
      baseNode.content.push({
        tag,
        attrs: {
          type: 'text/javascript',
          defer: 'defer',
          nomodule: 'nomodule',
          src: `${path.dirname(res.name) + path.basename(res.name, path.extname(res.name))}.old.js`
        }
      });
      baseNode.content.push({
        tag,
        attrs: {
          type: 'module',
          src: res.name
        }
      });
      break;

    case 'link': {
      const additionalContent = templateRes.script && templateRes.script.inline;
      const content = cssTagTemplate(res.name) + (additionalContent || '');
      baseNode.content.push({
        tag: 'script',
        attrs: {
          type: 'text/javascript'
        },
        content: terser.minify(content).code
      });
      break;
    }

    default: break;
  }
};

const extractResources = (templateName, tree) => {
  const resources = {};

  tree.match({ tag: /script|link/ }, (node) => {
    if (!resources[node.tag]) {
      resources[node.tag] = { files: [] };
    }

    const src = getSrc(node);

    if (node.tag === 'script' && node.attrs.type === 'text/javascript' && !src) {
      // inline script - merge it into one && process
      resources.script.inline = (resources.script.inline || '') + node.content;
      return;
    }

    const { files } = resources[node.tag];
    if (src && !src.startsWith('http')) {
      if (files.indexOf(src) === -1) {
        files.push(src);
      }
      return;
    }

    return node; // eslint-disable-line consistent-return
  });

  Object.keys(resources).forEach((tag) => {
    const tagResources = resources[tag];

    if (!tagResources.files.length) {
      return;
    }

    if (!opts.templateResources[tag]) {
      opts.templateResources[tag] = [];
    }

    const templateTagResources = opts.templateResources[tag];

    const existingResource = templateTagResources.filter(res => res.files.length === tagResources.files.length
      && res.files.sort().join(';') === tagResources.files.sort().join(';'))[0];

    if (existingResource) {
      tagResources.name = existingResource.name;
    } else if (tagResources.files.length) {
      tagResources.name = getResourceName(templateName, tag);
      templateTagResources.push(tagResources);
    }
  });

  return resources;
};

const processTemplate = templateName => (tree) => {
  const resources = processedTemplates[templateName] || extractResources(templateName, tree);

  processTemplate[templateName] = resources;

  tree.match({ tag: 'head' }, (head) => {
    head.content = head.content || [];

    Object.keys(resources).forEach((tagName) => {
      const resource = resources[tagName];
      appendNode(head, tagName, resource, resources);
    });

    return head;
  });

  const jobs = [];

  tree.match({ tag: 'svg', attrs: { class: spriteClass } }, (svg) => {
    jobs.push(
      svgo.optimize(posthtmlRender(svg.content)).then((result) => {
        svg.content = result.data;
      })
    );
    return svg;
  });

  return Promise.all(jobs).then(() => tree);
};

const postTemplate = post => file.vinyl(
  `${opts.src}/posts/${post.slug}/index.pug`,
  opts.src,
  `- const post = posts.filter(p => p.id === ${post.id})[0];\ninclude /post`,
  `${opts.src}/post.pug`
);

const reloadPugConfig = async () => {
  let posts = [];
  let places = [];

  try {
    posts = JSON.parse(await fs.readFile(path.join(opts.dist, 'posts.json'), 'utf-8'));
    places = JSON.parse(await fs.readFile(opts.placesJson, 'utf-8'));
  } catch (e) {} // eslint-disable-line

  const pugConfig = pugConfigFactory(posts, places);

  pugConfig.locals.relative = (src, templatePath) => resolve(src, path.dirname(templatePath));
  pugConfig.locals.basename = src => path.dirname(src) + path.sep + path.basename(src, path.extname(src));
  pugConfig.locals.extname = path.extname;

  return pugConfig;
};

module.exports = (options) => {
  opts = options;
};

module.exports.html = async function html() {
  opts.templateResources = {};
  processedTemplates = [];

  const pugConfig = await reloadPugConfig();

  const posts = pugConfig.locals.posts.map(postTemplate);

  const posthtmlConfig = async (vinylFile) => {
    const template = path.relative(opts.src, vinylFile.history[0]);
    return {
      plugins: [processTemplate(template)]
    };
  };

  return new Promise((res, reject) => mergeStream(
    gulp.src(opts.html, { base: opts.src }),
    ...posts
  )
    .pipe(pug({
      ...pugConfig,
      basedir: opts.src
    }))
    .on('error', reject)
    .pipe(embedSvg({
      root: opts.src,
      createSpritesheet: true,
      spritesheetClass: spriteClass
    }))
    .on('error', reject)
    .pipe(posthtml(posthtmlConfig))
    .on('error', reject)
    .pipe(gulp.dest(opts.dist))
    .on('end', res));
};

module.exports.rss = async function rss() {
  const pugConfig = await reloadPugConfig();
  return new Promise((res, rej) => gulp.src(opts.rss, { base: opts.src })
    .pipe(pug({
      ...pugConfig,
      basedir: opts.src
    }))
    .on('error', rej)
    .pipe(rename('rss'))
    .pipe(gulp.dest(opts.dist))
    .on('finish', res));
};
