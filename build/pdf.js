const path = require('path');
const puppeteer = require('puppeteer');

let opts;

module.exports = (options) => {
  opts = options;
};

module.exports.pdf = async function pdf() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const jobs = opts.pdf.map(async (task) => {
    await page.goto(task.url, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: path.join(opts.publicDist, task.file),
      format: 'A4'
    });
  });

  await Promise.all(jobs);
  await browser.close();
};
