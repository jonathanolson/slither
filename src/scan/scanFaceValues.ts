
import { Bounds2 } from 'phet-lib/dot';
// @ts-ignore
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

  const result = await worker.recognize( url );
  await worker.terminate();

  // NOTE: don't have a typed version of this metadata from Tesseract.js at the moment
  return result.data.symbols.map( ( symbol: any ) => {
    return new ScannedFaceValue(
      parseInt( symbol.text ),
      new Bounds2( symbol.bbox.x0, symbol.bbox.y0, symbol.bbox.x1, symbol.bbox.y1 ),
      symbol.confidence
    );
  } );
};

export class ScannedFaceValue {
  public constructor(
    public readonly value: number,
    public readonly bounds: Bounds2,
    public readonly confidence: number
  ) {}
}
