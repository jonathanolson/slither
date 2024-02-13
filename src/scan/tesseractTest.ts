
import tesseract from 'tesseract.js/dist/tesseract.esm.min.js';

const createWorker = tesseract.createWorker;

// TODO: scheduler, see https://github.com/naptha/tesseract.js/blob/HEAD/docs/workers_vs_schedulers.md

// TODO: with multiple rectangles, see https://github.com/naptha/tesseract.js/blob/HEAD/docs/examples.md
// TODO: for ideal, with multiple workers for the multiple rectangles

export default async ( url: string ) => {
  const worker = await createWorker( 'eng' );
  worker.setParameters( {
    tessedit_char_whitelist: '0123',
    tessedit_pageseg_mode: tesseract.PSM.PSM_SPARSE_TEXT
  } );

  const ret = await worker.recognize( url );
  const text = ret.data.text;
  await worker.terminate();
  return text;
};
