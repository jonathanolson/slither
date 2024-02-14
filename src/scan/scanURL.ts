import cv from '@techstark/opencv-js';
import { scanShapeFaceValue } from './scanFaceValues.ts';
import { cvReady, drawContour, imshow, matToGrayscale, matWithZeros, withMat } from './opencvUtils.ts';
import { ContourCollection } from './ContourCollection.ts';
import _ from '../workarounds/_';
import { Contour } from './Contour.ts';
import { Vector2 } from 'phet-lib/dot';

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
  // imshow( imgGray );

  // {
  //   const faceImage = withMat( threshold => cv.adaptiveThreshold( imgGray, threshold, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2 ) );
  //   imshow( faceImage );
  //
  //   const faceValues = await scanFaceValues( matToURL( faceImage ) );
  //   faceValues.forEach( faceValue => {
  //     cv.rectangle( faceImage, new cv.Point( faceValue.bounds.minX, faceValue.bounds.minY ), new cv.Point( faceValue.bounds.maxX, faceValue.bounds.maxY ), new cv.Scalar( 128, 128, 128 ) );
  //   } );
  //   imshow( faceImage );
  //
  //   faceImage.delete();
  // }

  const blurSize = 0;

  const blurred = blurSize > 0 ? withMat( blurred => cv.GaussianBlur( imgGray, blurred, new cv.Size( 5, 5 ), 0 ) ) : imgGray;
  // imshow( blurred );

  const blurredThreshold = withMat( threshold => cv.adaptiveThreshold( blurred, threshold, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2 ) );
  // imshow( blurredThreshold );

  const inverted = withMat( inverted => cv.bitwise_not( blurredThreshold, inverted ) );

  // {
  //   const lines = new cv.Mat();
  //   cv.HoughLinesP( inverted, lines, 1, Math.PI / 2, 30, 10, 0 );
  //   // draw lines
  //   let dst = cv.Mat.zeros(inverted.rows, inverted.cols, cv.CV_8UC3);
  //   for (let i = 0; i < lines.rows; ++i) {
  //       let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
  //       let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
  //       cv.line( dst, startPoint, endPoint, new cv.Scalar( 255, 0, 0 ) );
  //   }
  //   imshow( dst );
  // }

  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  // TODO: cv.RETR_LIST probably just fine, we don't care about the tree in this case
  cv.findContours( inverted, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE );

  const contourCollection = new ContourCollection( contours, hierarchy );
  const rootContour = contourCollection.rootContour;

  const widestSubtree = _.maxBy( [ rootContour, ...rootContour.getDescendantContours() ], contour => contour.children.length )!;

  const dotContours: Contour[] = [];
  const lineContours: Contour[] = [];
  const zeroOuterContours: Contour[] = [];
  const zeroInnerContours: Contour[] = [];
  const oneContours: Contour[] = [];
  const twoContours: Contour[] = [];
  const threeContours: Contour[] = [];
  const xContours: Contour[] = [];
  const unknownContours: Contour[] = [];

  // TODO: We need to handle "completed" puzzles. They will actually have a loop.

  // ZOMG compare convex hull vs bounding box... Xs likely to have high values, digits lower values

  for ( const contour of widestSubtree.children ) {
    if ( contour.getConvexity() > 0.9 ) {
      if ( contour.children.length ) {
        zeroOuterContours.push( contour );
        zeroInnerContours.push( contour.children[ 0 ] );
      }
      else {
        // TODO: straight lines(!) we need to figure out those... maybe by size
        dotContours.push( contour );
      }
    }
    // TODO: could lower this cutoff
    else if ( contour.getDiagonality() < 0.1 ) {
      lineContours.push( contour );
    }
    else {
      const scannedFaceValue = await scanShapeFaceValue( contour.shape! );

      if ( scannedFaceValue ) {
        if ( scannedFaceValue.value === '1' ) {
          oneContours.push( contour );
        }
        else if ( scannedFaceValue.value === '2' ) {
          twoContours.push( contour );
        }
        else if ( scannedFaceValue.value === '3' ) {
          threeContours.push( contour );
        }
        else if ( scannedFaceValue.value === 'x' ) {
          xContours.push( contour );
        }
        else {
          unknownContours.push( contour );
        }
      }
      else {
        // TODO: this... seems helpful as a fallback?
        lineContours.push( contour );
      }
    }
  }

  // { // Individual contours
  //   const dst = matWithZeros( img );
  //   widestSubtree.getDescendantContours().forEach( contour => {
  //     const index = contourCollection.contours.indexOf( contour );
  //     drawContour( dst, contours, index );
  //   } );
  //   imshow( dst );
  // }

  { // Grouped by classification
    const dst = matWithZeros( img );
    const showWithColor = ( ourContours: Contour[], color: cv.Scalar ) => {
      ourContours.forEach( contour => {
        const index = contourCollection.contours.indexOf( contour );
        drawContour( dst, contours, index, color );
      } );
    }
    // TODO: culori!
    showWithColor( dotContours, new cv.Scalar( 128, 128, 128 ) );
    showWithColor( lineContours, new cv.Scalar( 255, 255, 255 ) );
    showWithColor( xContours, new cv.Scalar( 255, 0, 0 ) );
    showWithColor( zeroOuterContours, new cv.Scalar( 255, 255, 0 ) );
    showWithColor( zeroInnerContours, new cv.Scalar( 255, 255, 0 ) );
    showWithColor( oneContours, new cv.Scalar( 100, 255, 0 ) );
    showWithColor( twoContours, new cv.Scalar( 0, 255, 255 ) );
    showWithColor( threeContours, new cv.Scalar( 50, 100, 255 ) );
    showWithColor( unknownContours, new cv.Scalar( 255, 0, 255 ) );
    imshow( dst );
  }

  const linePaths: Vector2[][] = [];
  const dotPoints: Vector2[] = [];
  const xPoints: Vector2[] = [];
  const faceLocations: FaceLocation[] = [];

  lineContours.forEach( lineContour => {
    const clusteredPoints = lineContour.getClusteredXYPoints( 10 ); // TODO: adjust in the future
    const linePoints = Contour.unoverlapLoop( clusteredPoints );

    linePaths.push( linePoints );
  } );
  dotContours.forEach( dotContour => {
    dotPoints.push( dotContour.bounds.center );
  } );
  xContours.forEach( xContour => {
    xPoints.push( xContour.bounds.center );
  } );
  zeroOuterContours.forEach( zeroOuterContour => {
    faceLocations.push( new FaceLocation( 0, zeroOuterContour.bounds.center ) );
  } );
  oneContours.forEach( oneContour => {
    faceLocations.push( new FaceLocation( 1, oneContour.bounds.center ) );
  } );
  twoContours.forEach( twoContour => {
    faceLocations.push( new FaceLocation( 2, twoContour.bounds.center ) );
  } );
  threeContours.forEach( threeContour => {
    faceLocations.push( new FaceLocation( 3, threeContour.bounds.center ) );
  } );

  {
    const canvas = document.createElement( 'canvas' );
    const context = canvas.getContext( '2d' )!;
    canvas.width = img.cols;
    canvas.height = img.rows;

    context.globalAlpha = 0.2;
    context.drawImage( domImage, 0, 0 );
    context.globalAlpha = 1;

    linePaths.forEach( points => {
      context.beginPath();
      points.forEach( ( point, index ) => {
        if ( index === 0 ) {
          context.moveTo( point.x, point.y );
        }
        else {
          context.lineTo( point.x, point.y );
        }
      } );
      context.strokeStyle = 'magenta';
      context.stroke();
    } );
    dotPoints.forEach( point => {
      context.beginPath();
      context.arc( point.x, point.y, 3, 0, Math.PI * 2 );
      context.fillStyle = 'black';
      context.fill();
    } );
    xPoints.forEach( point => {
      context.beginPath();
      context.moveTo( point.x - 5, point.y - 5 );
      context.lineTo( point.x + 5, point.y + 5 );
      context.moveTo( point.x - 5, point.y + 5 );
      context.lineTo( point.x + 5, point.y - 5 );
      context.strokeStyle = 'red';
      context.stroke();
    } );
    faceLocations.forEach( faceLocation => {
      context.beginPath();
      context.arc( faceLocation.point.x, faceLocation.point.y, 5, 0, Math.PI * 2 );
      context.fillStyle = [ 'rgb(255,255,0)', 'rgb(100,255,0)', 'rgb(0,255,255)', 'rgb(50,100,255)' ][ faceLocation.value ];
      context.fill();
    } );

    document.body.appendChild( canvas );
  }

  // Find dots: https://stackoverflow.com/questions/60603243/detect-small-dots-in-image

  // TODO: yup, delete things!
  imgGray.delete();

  // https://docs.opencv.org/4.x/d9/d61/tutorial_py_morphological_ops.html

  // TODO: opencv cleanup (delete things not used)
};

class FaceLocation {
  public constructor(
    public readonly value: number,
    public readonly point: Vector2
  ) {}
}

export default async ( url: string ) => {
  const domImage = document.createElement( 'img' );
  domImage.src = url;
  await domImage.decode();
  await cvReady;
  scanHTMLImageElement( domImage );
};
