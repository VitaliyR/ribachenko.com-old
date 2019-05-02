const fetch = require('node-fetch');
const process = require('process');
const path = require('path');
const gulp = require('gulp');

const image = require('./lib/image');
const file = require('./lib/file');
const currentPlace = require('../places.json').current;

const mapboxKey = process.env.MAPBOX_KEY;

const mapStyles = ['light', 'dark'];
let opts;

const getMapUrl = (style) => {
  const centerPos = `${currentPlace.lng},${currentPlace.lat}`;
  return `https://api.mapbox.com/styles/v1/mapbox/${style}-v10/static/pin-l+EC0005(${centerPos})/${centerPos},4,0,0/640x1080?access_token=${mapboxKey}`; // eslint-disable-line max-len
};

module.exports = (options) => {
  if (!mapboxKey) {
    throw new Error('MAPBOX_KEY isn\'t provided');
  }

  opts = options;
};

module.exports.maps = async function maps() {
  const imagesRequests = mapStyles
    .map(getMapUrl)
    .map(url => fetch(url));

  const imagesRaws = await Promise.all(imagesRequests);

  const jobs = imagesRaws.map(async (res, index) => {
    const fileName = path.join(opts.dist, `res/${mapStyles[index]}Map.png`);
    const body = await res.buffer();
    return new Promise((resolve) => {
      const stream = file.vinyl(fileName, opts.dist, body)
        .pipe(gulp.dest(opts.dist));

      image.process(stream)
        .pipe(gulp.dest(opts.dist))
        .on('finish', resolve);
    });
  });

  return Promise.all(jobs);
};
