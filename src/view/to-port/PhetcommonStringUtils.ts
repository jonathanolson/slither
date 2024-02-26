// Copyright 2013-2024, University of Colorado Boulder

import { TReadOnlyProperty } from 'phet-lib/axon';

/**
 * Collection of utility functions related to Strings.
 * @author Sam Reid (PhET Interactive Simulations)
 */

const StringUtils = {

  /**
   * NOTE: Please use StringUtils.fillIn instead of this function.
   *
   * http://mobzish.blogspot.com/2008/10/simple-messageformat-for-javascript.html
   * Similar to Java's MessageFormat, supports simple substitution, simple substitution only.
   * The full MessageFormat specification allows conditional formatting, for example to support pluralisation.
   *
   * Example:
   * > StringUtils.format( '{0} + {1}', 2, 3 )
   * "2 + 3"
   *
   * @param {string} pattern pattern string, with N placeholders, where N is an integer
   * @returns {string}
   * @public
   * @deprecated - please use StringUtils.fillIn
   */
  format: function( pattern: string, ...foo: any[] ) {
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    return pattern.replace( /{(\d)}/g, ( r, n ) => args[ +n + 1 ] );
  },

  /**
   * Fills in a set of placeholders in a template.
   * Placeholders are specified with pairs of curly braces, e.g. '{{name}} is {{age}} years old'
   * See https://github.com/phetsims/phetcommon/issues/36
   *
   * Example:
   * > StringUtils.fillIn( '{{name}} is {{age}} years old', { name: 'Fred', age: 23 } )
   * "Fred is 23 years old"
   *
   * @param {string|TReadOnlyProperty<string>} template - the template, containing zero or more placeholders
   * @param {Object} values - a hash whose keys correspond to the placeholder names, e.g. { name: 'Fred', age: 23 }
   *                          Unused keys are silently ignored. All placeholders do not need to be filled.
   * @returns {string}
   * @public
   */
  fillIn: function( template: string | TReadOnlyProperty<string>, values: Record<string, any> ) {
    // @ts-expect-error
    template = ( template && template.get ) ? template.get() : template;

    let newString = template;

    // {string[]} parse out the set of placeholders
    // @ts-expect-error
    const placeholders = template.match( /\{\{[^{}]+\}\}/g ) || [];

    // replace each placeholder with its corresponding value
    for ( let i = 0; i < placeholders.length; i++ ) {
      const placeholder = placeholders[ i ];

      // key is the portion of the placeholder between the curly braces
      const key = placeholder.replace( '{{', '' ).replace( '}}', '' );
      if ( values[ key ] !== undefined ) {

        // Support Properties as values
        const valueString = ( values[ key ] && values[ key ].get ) ? values[ key ].get() : values[ key ];
        // @ts-expect-error
        newString = newString.replace( placeholder, valueString );
      }
    }

    return newString;
  }
};

export default StringUtils;