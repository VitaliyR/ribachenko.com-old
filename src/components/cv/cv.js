const printButtonSel = '.js-print-button';
const pdfLink = '/cv.pdf';

let printIframe;

const printPdf = () => {
  try {
    printIframe.focus();
    printIframe.contentWindow.print();
  } catch (e) {
    window.open(pdfLink, '_blank');
  }
};

const printPdfHandler = () => {
  if (printIframe) {
    printPdf();
  } else {
    printIframe = document.createElement('iframe');
    printIframe.setAttribute('src', pdfLink);
    printIframe.setAttribute('class', 'u-hidden');
    printIframe.onload = printPdf;
    printIframe.onerror = printPdf;
    document.body.appendChild(printIframe);
  }
};

const bindListeners = () => {
  Array
    .from(document.body.querySelectorAll(printButtonSel))
    .forEach(node => node.addEventListener('click', printPdfHandler));
};

document.addEventListener('DOMContentLoaded', bindListeners);
