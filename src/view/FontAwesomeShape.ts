import { Shape } from 'phet-lib/kite';
import { combineOptions } from 'phet-lib/phet-core';
import { Path, PathOptions } from 'phet-lib/scenery';

// From https://github.com/onface/font-awesome (under SIL OFL 1.1 license) by Dave Gandy
// SVG in https://github.com/jalmeydaa/portfolio/blob/master/fonts/fontawesome-webfont.svg%3Fv%3D4.7.0
// List is https://fontawesome.com/v4/icons/

export const fontAwesomeGearShape = new Shape(
  'M1024 640q0 106 -75 181t-181 75t-181 -75t-75 -181t75 -181t181 -75t181 75t75 181zM1536 749v-222q0 -12 -8 -23t-20 -13l-185 -28q-19 -54 -39 -91q35 -50 107 -138q10 -12 10 -25t-9 -23q-27 -37 -99 -108t-94 -71q-12 0 -26 9l-138 108q-44 -23 -91 -38q-16 -136 -29 -186q-7 -28 -36 -28h-222q-14 0 -24.5 8.5t-11.5 21.5l-28 184q-49 16 -90 37l-141 -107q-10 -9 -25 -9q-14 0 -25 11q-126 114 -165 168q-7 10 -7 23q0 12 8 23q15 21 51 66.5t54 70.5q-27 50 -41 99l-183 27q-13 2 -21 12.5t-8 23.5v222q0 12 8 23t19 13l186 28q14 46 39 92q-40 57 -107 138q-10 12 -10 24q0 10 9 23q26 36 98.5 107.5t94.5 71.5q13 0 26 -10l138 -107q44 23 91 38q16 136 29 186q7 28 36 28h222q14 0 24.5 -8.5t11.5 -21.5l28 -184q49 -16 90 -37l142 107q9 9 24 9q13 0 25 -10q129 -119 165 -170q7 -8 7 -22q0 -12 -8 -23q-15 -21 -51 -66.5t-54 -70.5q26 -50 41 -98l183 -28q13 -2 21 -12.5t8 -23.5z',
).makeImmutable();
export const fontAwesomeStepBackwardShape = new Shape(
  'M979 1395q19 19 32 13t13 -32v-1472q0 -26 -13 -32t-32 13l-710 710q-9 9 -13 19v-678q0 -26 -19 -45t-45 -19h-128q-26 0 -45 19t-19 45v1408q0 26 19 45t45 19h128q26 0 45 -19t19 -45v-678q4 10 13 19z',
).makeImmutable();
export const fontAwesomeStepForwardShape = new Shape(
  'M45 -115q-19 -19 -32 -13t-13 32v1472q0 26 13 32t32 -13l710 -710q9 -9 13 -19v678q0 26 19 45t45 19h128q26 0 45 -19t19 -45v-1408q0 -26 -19 -45t-45 -19h-128q-26 0 -45 19t-19 45v678q-4 -10 -13 -19z',
).makeImmutable();
export const fontAwesomeBackwardShape = new Shape(
  'M1619 1395q19 19 32 13t13 -32v-1472q0 -26 -13 -32t-32 13l-710 710q-9 9 -13 19v-710q0 -26 -13 -32t-32 13l-710 710q-19 19 -19 45t19 45l710 710q19 19 32 13t13 -32v-710q4 10 13 19z',
).makeImmutable();
export const fontAwesomeForwardShape = new Shape(
  'M45 -115q-19 -19 -32 -13t-13 32v1472q0 26 13 32t32 -13l710 -710q9 -9 13 -19v710q0 26 13 32t32 -13l710 -710q19 -19 19 -45t-19 -45l-710 -710q-19 -19 -32 -13t-13 32v710q-4 -10 -13 -19z',
).makeImmutable();
export const fontAwesomeShareShape = new Shape(
  'M503.691 189.836L327.687 37.851C312.281 24.546 288 35.347 288 56.015v80.053C127.371 137.907 0 170.1 0 322.326c0 61.441 39.581 122.309 83.333 154.132 13.653 9.931 33.111-2.533 28.077-18.631C66.066 312.814 132.917 274.316 288 272.085V360c0 20.7 24.3 31.453 39.687 18.164l176.004-152c11.071-9.562 11.086-26.753 0-36.328z',
).makeImmutable();
export const fontAwesomePencilShape = new Shape(
  'M363 0l91 91l-235 235l-91 -91v-107h128v-128h107zM886 928q0 22 -22 22q-10 0 -17 -7l-542 -542q-7 -7 -7 -17q0 -22 22 -22q10 0 17 7l542 542q7 7 7 17zM832 1120l416 -416l-832 -832h-416v416zM1515 1024q0 -53 -37 -90l-166 -166l-416 416l166 165q36 38 90 38q53 0 91 -38l235 -234q37 -39 37 -91z',
).makeImmutable();
export const fontAwesomeQuestionCircleShape = new Shape(
  'M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm107.244-255.2c0 67.052-72.421 68.084-72.421 92.863V300c0 6.627-5.373 12-12 12h-45.647c-6.627 0-12-5.373-12-12v-8.659c0-35.745 27.1-50.034 47.579-61.516 17.561-9.845 28.324-16.541 28.324-29.579 0-17.246-21.999-28.693-39.784-28.693-23.189 0-33.894 10.977-48.942 29.969-4.057 5.12-11.46 6.071-16.666 2.124l-27.824-21.098c-5.107-3.872-6.251-11.066-2.644-16.363C184.846 131.491 214.94 112 261.794 112c49.071 0 101.45 38.304 101.45 88.8zM298 368c0 23.159-18.841 42-42 42s-42-18.841-42-42 18.841-42 42-42 42 18.841 42 42z',
).makeImmutable();

export const toFontAwesomePath = (shape: Shape, pathOptions?: PathOptions): Path => {
  return new Path(
    shape,
    combineOptions<PathOptions>(
      {
        maxWidth: 20,
        maxHeight: 20,
        fill: 'black',
      },
      pathOptions,
    ),
  );
};
