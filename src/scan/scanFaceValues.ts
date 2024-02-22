import { Bounds2 } from 'phet-lib/dot';
import tesseract from '../workarounds/tesseract';
import { combineOptions, optionize3 } from 'phet-lib/phet-core';
import { Shape } from 'phet-lib/kite';

const createWorker = tesseract.createWorker;

// TODO: scheduler, see https://github.com/naptha/tesseract.js/blob/HEAD/docs/workers_vs_schedulers.md

// TODO: with multiple rectangles, see https://github.com/naptha/tesseract.js/blob/HEAD/docs/examples.md
// TODO: for ideal, with multiple workers for the multiple rectangles

let worker: any = null;

export type scanFaceValuesOptions = {
  whitelistChars?: string;
  segmentation?: 'sparse-text' | 'single-char';
};

const defaults = {
  whitelistChars: '0123',
  segmentation: 'sparse-text'
} as const;

const scanFaceValues = async ( url: string, providedOptions?: scanFaceValuesOptions ): Promise<ScannedFaceValue[]> => {
  const options = optionize3<scanFaceValuesOptions>()( {}, defaults, providedOptions );

  if ( !worker ) {
    worker = await createWorker( 'eng' );
  }

  worker.setParameters( {
    tessedit_char_whitelist: options.whitelistChars,
    tessedit_pageseg_mode: {
      'sparse-text': tesseract.PSM.SPARSE_TEXT,
      'single-char': tesseract.PSM.SINGLE_CHAR
    }[ options.segmentation ] // see https://github.com/tesseract-ocr/tesseract/blob/4.0.0/src/ccstruct/publictypes.h#L163
  } );

  const result = await worker.recognize( url );

  // TODO: we... terminate sometime?
  // await worker.terminate();

  // NOTE: don't have a typed version of this metadata from Tesseract.js at the moment
  return result.data.symbols/*.filter( ( symbol: any ) => [ '0', '1', '2', '3' ].includes( symbol.text ) )*/.map( ( symbol: any ) => {
    return new ScannedFaceValue(
      symbol.text,
      new Bounds2( symbol.bbox.x0, symbol.bbox.y0, symbol.bbox.x1, symbol.bbox.y1 ),
      symbol.confidence
    );
  } );
};
export default scanFaceValues;

let scratchCanvas: HTMLCanvasElement | null = null;
let scratchContext: CanvasRenderingContext2D | null = null;
export const scanShapeFaceValue = async ( shape: Shape, options?: scanFaceValuesOptions ): Promise<ScannedFaceValue | null> => {
  const padding = 7;

  if ( !scratchCanvas ) {
    scratchCanvas = document.createElement( 'canvas' );
  }

  if ( !scratchContext ) {
    scratchContext = scratchCanvas.getContext( '2d' )!;
  }

  scratchCanvas.width = shape.bounds.width + padding * 2;
  scratchCanvas.height = shape.bounds.height + padding * 2;

  scratchContext.setTransform(
    1, 0, 0, 1, -shape.bounds.minX + padding, -shape.bounds.minY + padding
  );

  scratchContext.fillStyle = 'white';
  scratchContext.fillRect( 0, 0, scratchCanvas.width, scratchCanvas.height );

  scratchContext.beginPath();
  shape.writeToContext( scratchContext );

  scratchContext.fillStyle = 'black';
  scratchContext.fill();
  scratchContext.strokeStyle = 'black';
  scratchContext.stroke();

  return ( await scanFaceValues( scratchCanvas.toDataURL(), combineOptions<scanFaceValuesOptions>( {
    segmentation: 'single-char',
    whitelistChars: '0123x'
  }, options ) ) )[ 0 ] || null;
};

export class ScannedFaceValue {
  public constructor(
    public readonly value: string,
    public readonly bounds: Bounds2,
    public readonly confidence: number
  ) {}
}
