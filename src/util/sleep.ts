// Work around iOS Safari... just not really calling setTimeout. Fun times. Hook into the animation frame if it hasn't yet.
import SlitherQueryParameters from '../SlitherQueryParameters.ts';

let workaroundResolve: ((value: unknown) => void) | null = null;
let workaroundResolveCount = 0;
export const workaroundResolveStep = () => {
  if (workaroundResolve) {
    workaroundResolveCount++;

    if (workaroundResolveCount > 5) {
      const resolve = workaroundResolve;
      workaroundResolve = null;
      resolve(null);
    }
  }
};

export const sleep = async function (milliseconds: number) {
  return new Promise((resolve, reject) => {
    workaroundResolve = resolve;
    workaroundResolveCount = 0;

    SlitherQueryParameters.debugSleep && console.log('sleep start');
    setTimeout(() => {
      SlitherQueryParameters.debugSleep && console.log('sleep end');
      if (workaroundResolve === resolve) {
        workaroundResolve = null;
        resolve(null);
      }
      SlitherQueryParameters.debugSleep && console.log('resolved');
    }, milliseconds);
  });
};
