const gulp = require('gulp');
const glob = require('fast-glob');
const posthtml = require('posthtml');
const yaml = require('js-yaml');
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
    const lang = langClass ? langClass.trim().replace('language-', '') : '';
    const langReadable = languages[lang.toLowerCase()] || (lang ? (lang[0].toUpperCase() + lang.slice(1)) : '');

    [pre, codeBlock].forEach((node) => {
      node.attrs = node.attrs || {};
      node.attrs.class = langClass || 'language-js';
    });

    if (langReadable) {
      pre.content.unshift({
        tag: 'span',
        attrs: {
          class: 'prism-show-language'
        },
        content: [langReadable]
      });
    }

    return pre;
  });
};

const parseMeta = async ({ frontmatter: metaJson, filePath, markdown }) => {
  const dirname = path.dirname(filePath);

  if (!metaJson.published) {
    return null;
  }

  const slug = path.dirname(path.relative(opts.posts, filePath)).replace(/^\d{3}-/, '');
  metaJson.slug = slug;

  const publishedDate = dayjs(metaJson.published_at);

  metaJson.id = publishedDate.valueOf();
  metaJson.published_at_formatted = publishedDate.format('DD MMM YY');
  metaJson.published_at_formatted_long = publishedDate.format('DD MMMM YYYY');

  let htmlContent = '';
  let textContent = '';
  try {
    htmlContent = marked(markdown);
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
  metaJson.href = path.join('/', opts.postsDest, slug, '/');

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
    const distResPath = path.join(opts.dist, opts.postsDest, slug, 'res');

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

const parseMarkdownWithFrontmatter = async (filePath) => {
  let string = await fs.readFile(filePath, 'utf-8');

  string = string.replace('\r\n', '\n');

  let frontmatter = null;
  let markdown = string;
  const frontmatterType = {
    type: 'yaml',
    startDelimiter: '---\n',
    endDelimiter: '\n---',
    parse: str => yaml.safeLoad(str, { schema: yaml.JSON_SCHEMA })
  };
  const index = string.indexOf(frontmatterType.endDelimiter);
  if (index !== -1) {
    const endDelimEndIndex = index + frontmatterType.endDelimiter.length;
    const afterEndDelim = string.substring(endDelimEndIndex);
    const afterEndDelimMatch = afterEndDelim.match(/^\s*?(\n|$)/);

    if (afterEndDelimMatch) {
      const data = string.substring(frontmatterType.startDelimiter.length, index);
      frontmatter = frontmatterType.parse(data);
      markdown = afterEndDelim.substring(afterEndDelimMatch[0].length);
    }
  }

  return { frontmatter, markdown, filePath };
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

  const postsFilesPaths = await glob(path.join(opts.posts, '**/index.md'));
  const postsFiles = (await Promise.all(
    postsFilesPaths.map(filePath => parseMarkdownWithFrontmatter(filePath).then(parseMeta))
  ))
    .filter(meta => meta)
    .sort((a, b) => b.id - a.id);

  return fs.writeFile(path.join(opts.dist, 'posts.json'), JSON.stringify(postsFiles));
};
