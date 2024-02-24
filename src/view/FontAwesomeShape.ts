import { Shape } from 'phet-lib/kite';
import { combineOptions } from 'phet-lib/phet-core';
import { Path, PathOptions } from 'phet-lib/scenery';

// From https://github.com/onface/font-awesome (under SIL OFL 1.1 license) by Dave Gandy
// SVG in https://github.com/jalmeydaa/portfolio/blob/master/fonts/fontawesome-webfont.svg%3Fv%3D4.7.0
// List is https://fontawesome.com/v4/icons/

export const fontAwesomeGearShape = new Shape( 'M1024 640q0 106 -75 181t-181 75t-181 -75t-75 -181t75 -181t181 -75t181 75t75 181zM1536 749v-222q0 -12 -8 -23t-20 -13l-185 -28q-19 -54 -39 -91q35 -50 107 -138q10 -12 10 -25t-9 -23q-27 -37 -99 -108t-94 -71q-12 0 -26 9l-138 108q-44 -23 -91 -38q-16 -136 -29 -186q-7 -28 -36 -28h-222q-14 0 -24.5 8.5t-11.5 21.5l-28 184q-49 16 -90 37l-141 -107q-10 -9 -25 -9q-14 0 -25 11q-126 114 -165 168q-7 10 -7 23q0 12 8 23q15 21 51 66.5t54 70.5q-27 50 -41 99l-183 27q-13 2 -21 12.5t-8 23.5v222q0 12 8 23t19 13l186 28q14 46 39 92q-40 57 -107 138q-10 12 -10 24q0 10 9 23q26 36 98.5 107.5t94.5 71.5q13 0 26 -10l138 -107q44 23 91 38q16 136 29 186q7 28 36 28h222q14 0 24.5 -8.5t11.5 -21.5l28 -184q49 -16 90 -37l142 107q9 9 24 9q13 0 25 -10q129 -119 165 -170q7 -8 7 -22q0 -12 -8 -23q-15 -21 -51 -66.5t-54 -70.5q26 -50 41 -98l183 -28q13 -2 21 -12.5t8 -23.5z' ).makeImmutable();
export const fontAwesomeStepBackwardShape = new Shape( 'M979 1395q19 19 32 13t13 -32v-1472q0 -26 -13 -32t-32 13l-710 710q-9 9 -13 19v-678q0 -26 -19 -45t-45 -19h-128q-26 0 -45 19t-19 45v1408q0 26 19 45t45 19h128q26 0 45 -19t19 -45v-678q4 10 13 19z' ).makeImmutable();
export const fontAwesomeStepForwardShape = new Shape( 'M45 -115q-19 -19 -32 -13t-13 32v1472q0 26 13 32t32 -13l710 -710q9 -9 13 -19v678q0 26 19 45t45 19h128q26 0 45 -19t19 -45v-1408q0 -26 -19 -45t-45 -19h-128q-26 0 -45 19t-19 45v678q-4 -10 -13 -19z' ).makeImmutable();
export const fontAwesomeBackwardShape = new Shape( 'M1619 1395q19 19 32 13t13 -32v-1472q0 -26 -13 -32t-32 13l-710 710q-9 9 -13 19v-710q0 -26 -13 -32t-32 13l-710 710q-19 19 -19 45t19 45l710 710q19 19 32 13t13 -32v-710q4 10 13 19z' ).makeImmutable();
export const fontAwesomeForwardShape = new Shape( 'M45 -115q-19 -19 -32 -13t-13 32v1472q0 26 13 32t32 -13l710 -710q9 -9 13 -19v710q0 26 13 32t32 -13l710 -710q19 -19 19 -45t-19 -45l-710 -710q-19 -19 -32 -13t-13 32v710q-4 -10 -13 -19z' ).makeImmutable();
export const fontAwesomeShareShape = new Shape( 'M503.691 189.836L327.687 37.851C312.281 24.546 288 35.347 288 56.015v80.053C127.371 137.907 0 170.1 0 322.326c0 61.441 39.581 122.309 83.333 154.132 13.653 9.931 33.111-2.533 28.077-18.631C66.066 312.814 132.917 274.316 288 272.085V360c0 20.7 24.3 31.453 39.687 18.164l176.004-152c11.071-9.562 11.086-26.753 0-36.328z' ).makeImmutable();

export const toFontAwesomePath = ( shape: Shape, pathOptions?: PathOptions ): Path => {
  return new Path( shape, combineOptions<PathOptions>( {
    maxWidth: 15,
    maxHeight: 15,
    fill: 'black'
  }, pathOptions ) );
};
