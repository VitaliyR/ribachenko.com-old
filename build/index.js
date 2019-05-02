const maps = require('./maps');
const posts = require('./posts');
const server = require('./hmr');
const html = require('./html');
const css = require('./css');
const js = require('./js');
const util = require('./util');

const tasks = [maps, posts, server, html, css, js, util];

module.exports = (opts) => {
  tasks.forEach(t => t(opts));
  return {
    ...maps,
    ...posts,
    ...server,
    ...html,
    ...css,
    ...js,
    ...util
  };
};
