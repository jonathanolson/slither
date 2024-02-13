
import stuff from 'tesseract.js/dist/tesseract.esm.min.js';

const createWorker = stuff.createWorker;

export default async ( url: string ) => {
  const worker = await createWorker( 'eng' );
  const ret = await worker.recognize( url );
  const text = ret.data.text;
  await worker.terminate();
  return text;
};
