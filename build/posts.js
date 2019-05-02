const gulp = require('gulp');
const glob = require('fast-glob');
const posthtml = require('posthtml');
const path = require('path');
const fs = require('fs-fs');
const dayjs = require('dayjs');
const Prism = require('prismjs');
const marked = require('marked');
const image = require('./lib/image');
const languages = require('./languages.json');

const maxExcerptLength = 120;
const maxDescriptionLength = 500;

let opts;

marked.setOptions({
  highlight(code, lang) {
    return Prism.highlight(code, Prism.languages[lang] || Prism.languages.js, lang);
  }
});

const processPostHtml = (tree) => {
  tree.match({ tag: 'a' }, (a) => {
    a.attrs.class = 'o-link';
    const isTextNode = a.content.every(n => typeof n === 'string');
    if (!isTextNode) {
      a.attrs.class += ' o-link--plain';
    }
    return a;
  });

  tree.match({ tag: 'img' }, (img) => {
    img.attrs = img.attrs || {};
    const { attrs } = img;
    const isProcessed = attrs.class && attrs.class.indexOf('js-processed') !== -1;
    const isGif = attrs.src && attrs.src.indexOf('.gif') !== -1;
    const isExternal = attrs.src && attrs.src.startsWith('http');

    if (isProcessed || isGif || isExternal) {
      if (isGif || isExternal) {
        img.attrs.class = 'o-image js-processed';
      }
      return isProcessed ? img : {
        tag: 'a',
        attrs: {
          target: '_blank',
          href: img.attrs.src
        },
        content: [img]
      };
    }

    return {
      tag: 'a',
      attrs: {
        target: '_blank',
        href: attrs.src
      },
      content: [
        {
          tag: 'picture',
          attrs: {
            class: 'o-image'
          },
          content: [
            {
              tag: 'source',
              attrs: {
                type: 'image/webp',
                srcset: attrs.src.replace(path.extname(attrs.src), '.webp')
              }
            },
            {
              tag: 'img',
              attrs: {
                class: 'o-image js-processed',
                src: attrs.src
              }
            }
          ]
        }
      ]
    };
  });

  tree.match({ tag: 'hr' }, hr => ({
    ...hr,
    attrs: {
      class: 'o-hr'
    }
  }));

  tree.match({ tag: 'pre', content: [{ tag: 'code' }] }, (pre) => {
    const codeBlock = pre.content[0];
    const langClass = codeBlock.attrs ? codeBlock.attrs.class : null;
    const lang = langClass ? langClass.trim().replace('language-', '') : 'js';
    const langReadable = languages[lang.toLowerCase()] || (lang[0].toUpperCase() + lang.slice(1));

    pre.attrs = pre.attrs || {};
    pre.attrs.class = langClass;

    pre.content.unshift({
      tag: 'span',
      attrs: {
        class: 'prism-show-language'
      },
      content: [langReadable]
    });

    return pre;
  });
};

const parseMeta = async (metaFilePath) => {
  const dirname = path.dirname(metaFilePath);
  const metaFile = await fs.readFile(metaFilePath, 'utf-8');
  const metaJson = JSON.parse(metaFile);

  if (!metaJson.published) {
    return null;
  }

  const publishedDate = dayjs(metaJson.published_at);

  metaJson.id = publishedDate.valueOf();
  metaJson.published_at_formatted = publishedDate.format('DD MMM YY');
  metaJson.published_at_formatted_long = publishedDate.format('DD MMMM YYYY');

  const postFilePath = path.join(dirname, 'post.md');
  let htmlContent = '';
  let textContent = '';
  try {
    htmlContent = marked(await fs.readFile(postFilePath, 'utf-8'));
    htmlContent = await posthtml()
      .use(processPostHtml)
      .process(htmlContent)
      .then(res => res.html);
    textContent = htmlContent.replace(/<\/?.+?>/gm, '').trim();
  } catch (e) {
    throw e;
  }

  metaJson.description = textContent.length < maxExcerptLength
    ? textContent
    : `${textContent.substr(0, maxExcerptLength).replace(/\n/ig, ' ').trim()}...`;

  metaJson.descriptionLong = textContent.length < maxDescriptionLength
    ? textContent
    : `${textContent.substr(0, maxDescriptionLength).replace(/\n/g, ' ').trim()}...`;

  metaJson.html = htmlContent;
  metaJson.href = path.join('/', opts.posts, metaJson.slug, '/');
  if (metaJson.image) {
    const imagePath = path.join(metaJson.href, metaJson.image);
    const imageExt = path.extname(imagePath);
    const imageSmallPath = `${imagePath.replace(imageExt, '')}_small${imageExt}`;
    metaJson.image = imagePath;
    metaJson.imageSmall = imageSmallPath;
  }

  const resDirPath = path.join(dirname, 'res');
  const resDirExists = await fs.exists(resDirPath);

  if (resDirExists) {
    const distResPath = path.join(opts.dist, opts.posts, metaJson.slug, 'res');

    await new Promise((res) => {
      const stream = gulp.src(path.join(resDirPath, '**'))
        .pipe(gulp.dest(distResPath));

      image.process(stream)
        .pipe(gulp.dest(distResPath))
        .on('finish', res);
    });

    await new Promise((res) => {
      const stream = gulp.src(path.join(resDirPath, 'featured*'));

      image.processPostFeaturedImages(stream)
        .pipe(gulp.dest(distResPath))
        .on('finish', res);
    });
  }

  return metaJson;
};

/**
 * Exports
 */
module.exports = async (options) => {
  opts = options;
};

module.exports.posts = async function posts() {
  try {
    await fs.mkdir(path.join(opts.dist, opts.postDir));
  } catch (e) {} // eslint-disable-line no-empty

  const metaFiles = await glob(path.join(opts.posts, '**/meta.json'));
  const parsedMetas = (await Promise.all(metaFiles.map(parseMeta)))
    .filter(meta => meta)
    .sort((a, b) => a.id < b.id);

  return fs.writeFile(path.join(opts.dist, 'posts.json'), JSON.stringify(parsedMetas));
};
