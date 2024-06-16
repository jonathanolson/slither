import { Contour } from './Contour';
import cv from '@techstark/opencv-js';

import _ from '../workarounds/_';

export class ContourCollection {
  public readonly contours: Contour[];
  public readonly topLevelContours: Contour[] = [];
  public readonly rootContour: Contour;

  public constructor(inputContours: cv.MatVector, hierarchy: cv.Mat) {
    const size = inputContours.size();

    this.rootContour = new Contour(null);

    this.contours = _.range(0, size).map((i) => {
      return new Contour(inputContours.get(i));
    });
    for (let i = 0; i < size; i++) {
      const contour = this.contours[i];

      const nextIndex = hierarchy.data32S[4 * i + 0];
      const prevIndex = hierarchy.data32S[4 * i + 1];
      const firstChildIndex = hierarchy.data32S[4 * i + 2];
      const parentIndex = hierarchy.data32S[4 * i + 3];

      if (nextIndex >= 0) {
        contour.next = this.contours[nextIndex];
      }
      if (prevIndex >= 0) {
        contour.prev = this.contours[prevIndex];
      }
      if (firstChildIndex >= 0) {
        contour.firstChild = this.contours[firstChildIndex];
      }
      if (parentIndex >= 0) {
        contour.parent = this.contours[parentIndex];
      } else {
        this.topLevelContours.push(contour);
        this.rootContour.children.push(contour);
        if (this.rootContour.children.length === 1) {
          this.rootContour.firstChild = contour;
        }
      }
    }
    for (let i = 0; i < size; i++) {
      const contour = this.contours[i];

      if (contour.firstChild) {
        let child: Contour | null = contour.firstChild;
        while (child) {
          contour.children.push(child);
          child = child.next;
        }
      }
    }
  }
}
