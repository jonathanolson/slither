
import cv from '@techstark/opencv-js';
import scanFaceValues from './scanFaceValues.ts';
import { contourToPoints, cvReady, drawContour, imshow, matToGrayscale, matToURL, matWithZeros, withMat } from './opencvUtils.ts';
import { ContourCollection } from './ContourCollection.ts';
import _ from '../workarounds/_';

// Basic mat ops: https://docs.opencv.org/4.x/de/d06/tutorial_js_basic_ops.html
// Image ops: https://docs.opencv.org/4.x/d2/df0/tutorial_js_table_of_contents_imgproc.html
//   Transform images (can do affine/perspective!): https://docs.opencv.org/4.x/dd/d52/tutorial_js_geometric_transformations.html
// mat cols/rows, depth(), channels(), type() ---- clone()
// roi - grab a rectangle, new cv.Rect( minX, minY, maxX, maxY ), src.roi( rect )

// Perhaps do an initial scan for number values (0-3), + contours. Determine the contour in the tree
// NOTE: for more puzzles, allow more digits!!!!
// that contains the "majority" of the number values (... how)?
// That will presumably be our interior boundary (we can then see if it has a ton of children, it's probably right)
// ALTERNATIVE: Find the thing with the largest number of ... children? Or dots/lines?

// Dot-detect (tell which ones are x's and which are dots by convexity)
// Determine potential grid from this (within the outline)? --- what about fully filled in puzzles though?

// Skeletonize the lines: https://stackoverflow.com/questions/33095476/is-there-a-build-in-function-to-do-skeletonization
// note-- we'll want to remove small lines(!)
// Then try to determine vertices along the lines

const scanHTMLImageElement = async ( domImage: HTMLImageElement ) => {
  const img = cv.imread( domImage );
  imshow( img );

  const imgGray = matToGrayscale( img );
  imshow( imgGray );

  {
    const faceImage = withMat( threshold => cv.adaptiveThreshold( imgGray, threshold, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2 ) );
    imshow( faceImage );

    const faceValues = await scanFaceValues( matToURL( faceImage ) );
    faceValues.forEach( faceValue => {
      cv.rectangle( faceImage, new cv.Point( faceValue.bounds.minX, faceValue.bounds.minY ), new cv.Point( faceValue.bounds.maxX, faceValue.bounds.maxY ), new cv.Scalar( 128, 128, 128 ) );
    } );
    imshow( faceImage );

    faceImage.delete();
  }

  const blurSize = 0;

  const blurred = blurSize > 0 ? withMat( blurred => cv.GaussianBlur( imgGray, blurred, new cv.Size( 5, 5 ), 0 ) ) : imgGray;

  imshow( blurred );

  const blurredThreshold = withMat( threshold => cv.adaptiveThreshold( blurred, threshold, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2 ) );

  imshow( blurredThreshold );

  const inverted = withMat( inverted => cv.bitwise_not( blurredThreshold, inverted ) );

  {
    const lines = new cv.Mat();
    cv.HoughLinesP( inverted, lines, 1, Math.PI / 2, 30, 10, 0 );
    // draw lines
    let dst = cv.Mat.zeros(inverted.rows, inverted.cols, cv.CV_8UC3);
    for (let i = 0; i < lines.rows; ++i) {
        let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
        let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
        cv.line( dst, startPoint, endPoint, new cv.Scalar( 255, 0, 0 ) );
    }
    imshow( dst );
  }

  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  // TODO: cv.RETR_LIST probably just fine, we don't care about the tree in this case
  cv.findContours( inverted, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE );

  const contourCollection = new ContourCollection( contours, hierarchy );
  const rootContour = contourCollection.rootContour;

  const widestSubtree = _.maxBy( rootContour.getDescendantContours(), contour => contour.children.length )!;

  {
    const dst = matWithZeros( img );
    widestSubtree.getDescendantContours().forEach( contour => {
      const index = contourCollection.contours.indexOf( contour );
      drawContour( dst, contours, index );
    } );
    imshow( dst );
  }

  // Find dots: https://stackoverflow.com/questions/60603243/detect-small-dots-in-image

  // TODO: yup, delete things!
  imgGray.delete();

  // https://docs.opencv.org/4.x/d9/d61/tutorial_py_morphological_ops.html

  console.log( contourToPoints( contours.get( 4 ) ) );

  // TODO: opencv cleanup (delete things not used)
};

export default async ( url: string ) => {
  const domImage = document.createElement( 'img' );
  domImage.src = url;
  await domImage.decode();
  await cvReady;
  scanHTMLImageElement( domImage );
};
