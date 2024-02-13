
import cv from '@techstark/opencv-js';

const cvReady = new Promise( resolve => {
  // @ts-ignore
  cv.onRuntimeInitialized = resolve;
} );

const scanHTMLImageElement = async ( domImage: HTMLImageElement ) => {
  const img = cv.imread( domImage );
  console.log( img );

  const imgGray = new cv.Mat();
  cv.cvtColor( img, imgGray, cv.COLOR_BGR2GRAY );

  const imgBlurred = new cv.Mat();
  cv.GaussianBlur( imgGray, imgBlurred, new cv.Size( 5, 5 ), 0 );

  const imgThreshold = new cv.Mat();
  cv.adaptiveThreshold( imgBlurred, imgThreshold, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2 );

  const inverted = new cv.Mat();
  cv.bitwise_not( imgThreshold, inverted );

  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours( inverted, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE );

  // Find dots: https://stackoverflow.com/questions/60603243/detect-small-dots-in-image

  // https://docs.opencv.org/4.x/d9/d61/tutorial_py_morphological_ops.html

  let foundContour = new cv.MatVector();

  //Get area for all contours so we can find the biggest
  let sortableContours = [];
  for (let i = 0; i < contours.size(); i++) {
    let cnt = contours.get(i);
    let area = cv.contourArea(cnt, false);
    let perim = cv.arcLength(cnt, false);

    sortableContours.push({ areaSize: area, perimiterSize: perim, contour: cnt });
  }

  sortableContours = sortableContours.sort((item1, item2) => { return (item1.areaSize > item2.areaSize) ? -1 : (item1.areaSize < item2.areaSize) ? 1 : 0; }).slice(0, 5);

  //Ensure the top area contour has 4 corners (NOTE: This is not a perfect science and likely needs more attention)
  let approx = new cv.Mat();
  cv.approxPolyDP(sortableContours[0].contour, approx, .05 * sortableContours[0].perimiterSize, true);

  if (approx.rows == 4) {
    console.log('Found a 4-corner approx');
    foundContour = approx;
  }
  else{
    console.log('No 4-corner large contour!');
    return;
  }

  //Find the corners
  let corner1 = new cv.Point(foundContour.data32S[0], foundContour.data32S[1]);
  let corner2 = new cv.Point(foundContour.data32S[2], foundContour.data32S[3]);
  let corner3 = new cv.Point(foundContour.data32S[4], foundContour.data32S[5]);
  let corner4 = new cv.Point(foundContour.data32S[6], foundContour.data32S[7]);

  //Order the corners
  let cornerArray = new cv.MatVector();
  cornerArray = [{ corner: corner1 }, { corner: corner2 }, { corner: corner3 }, { corner: corner4 }];
  //Sort by Y position (to get top-down)
  cornerArray.sort((item1, item2) => {
    return (item1.corner.y < item2.corner.y) ? -1 : (item1.corner.y > item2.corner.y) ? 1 : 0;
  }).slice(0, 5);

  console.log( corner1, corner2, corner3, corner4 );
//
//   // debugger;
//
//   // for (c of cornerArray) {
//   //   cv.drawContours(inverted, c.corner, -1, color, 1, cv.LINE_8, hierarchy, 100);
//   // }
//
// // cv.imshow('canvasOutput', img);
//
  const canvas = document.createElement( 'canvas' );
  canvas.width = domImage.width;
  canvas.height = domImage.height;
  cv.imshow( canvas, inverted );
  document.body.appendChild( canvas );

  // TODO: opencv cleanup
//
//   // debugger;
};

export default async ( url: string ) => {
  const domImage = document.createElement( 'img' );
  domImage.src = url;
  await domImage.decode();
  await cvReady;
  scanHTMLImageElement( domImage );
};
