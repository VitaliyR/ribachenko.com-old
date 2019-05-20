const path = require('path');
const flatMap = require('flat-map').default;
const imageScale = require('gulp-scale-images');

const featureImageSmallWidth = 400;
const imageExt = ['.png', '.jpg'];

const getNameForImage = (output, scale, cb) => {
  const fileName = [path.basename(output.path, output.extname)];
  scale.suffix && fileName.push(scale.suffix);
  fileName.push(scale.format ? `.${scale.format}` : output.extname);
  cb(null, fileName.join(''));
};

module.exports.process = function process(stream) {
  return stream
    .pipe(flatMap((file, cb) => {
      const isImage = imageExt.indexOf(file.extname) !== -1;

      if (!isImage) {
        cb(null, []);
        return;
      }

      const f = file.clone();

      f.scale = {
        format: 'webp',
        maxWidth: Number.MAX_SAFE_INTEGER,
        formatOptions: {
          quality: 90
        }
      };

      cb(null, [f]);
    }))
    .pipe(imageScale(getNameForImage));
};

module.exports.processPostFeaturedImages = function processPostFeaturedImages(stream) {
  return stream
    .pipe(flatMap((file, cb) => {
      const isImage = imageExt.indexOf(file.extname) !== -1;

      if (!isImage) {
        cb(null, []);
        return;
      }

      const files = [1, 2].map(scaleFactor => [null, 'webp'].map((format) => {
        const f = file.clone();
        f.scale = {
          maxWidth: featureImageSmallWidth * scaleFactor,
          suffix: scaleFactor > 1 ? `_small@${scaleFactor}x` : '_small',
          format
        };
        return f;
      }));

      cb(null, [].concat(...files));
    }))
    .pipe(imageScale(getNameForImage));
};
