// Copyright 2016-2022, University of Colorado Boulder

/**
 * Query String parser that supports type coercion, defaults, error checking, etc. based on a schema.
 * See QueryStringMachine.get for the description of a schema.
 *
 * Implemented as a UMD (Universal Module Definition) so that it's capable of working everywhere.
 * See https://github.com/umdjs/umd/blob/master/templates/returnExports.js
 *
 * See TYPES for a description of the schema types and their properties.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
( function( root, factory ) {

  if ( typeof window.define === 'function' && window.define.amd ) {

    // AMD. Register as an anonymous module.
    window.define( [], factory );
  }
  else if ( typeof module === 'object' && module.exports ) {

    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  }
  else {

    // Browser globals (root is window)
    root.QueryStringMachine = factory();
  }
}( this, () => {

  // Default string that splits array strings
  const DEFAULT_SEPARATOR = ',';

  // If a query parameter has private:true in its schema, it must pass this predicate to be read from the URL.
  // See https://github.com/phetsims/chipper/issues/743
  const privatePredicate = () => {
    // Trying to access localStorage may fail with a SecurityError if cookies are blocked in a certain way.
    // See https://github.com/phetsims/qa/issues/329 for more information.
    try {
      return localStorage.getItem( 'phetTeamMember' ) === 'true';
    }
    catch( e ) {
      return false;
    }
  };

  /**
   * Valid parameter strings begin with ? or are the empty string.  This is used for assertions in some cases and for
   * throwing Errors in other cases.
   * @param {string} string
   * @returns {boolean}
   */
  const isParameterString = string => string.length === 0 || string.indexOf( '?' ) === 0;

  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.
  return ( function() {

    /**
     * In order to support graceful failures for user-supplied values, we fall back to default values when public: true
     * is specified.  If the schema entry is public: false, then a queryStringMachineAssert is thrown.
     * @param {boolean} predicate
     * @param {string} key
     * @param {Object} value - value of the parsed type, or, if parsing failed, the {string} that would not parse
     * @param {Object} schema
     * @param {string} message
     * @returns {Object}
     */
    const getValidValue = ( predicate, key, value, schema, message ) => {
      if ( !predicate ) {

        if ( schema.public ) {
          QueryStringMachine.addWarning( key, value, message );
          if ( schema.hasOwnProperty( 'defaultValue' ) ) {
            value = schema.defaultValue;
          }
          else {
            const typeSchema = TYPES[ schema.type ];
            queryStringMachineAssert( typeSchema.hasOwnProperty( 'defaultValue' ),
              'Type must have a default value if the provided schema does not have one.' );
            value = typeSchema.defaultValue;
          }
        }
        else {
          queryStringMachineAssert( predicate, message );
        }
      }
      return value;
    };

    /**
     * Query String Machine is a query string parser that supports type coercion, default values & validation. Please
     * visit PhET's <a href="https://github.com/phetsims/query-string-machine" target="_blank">query-string-machine</a>
     * repository for documentation and examples.
     */
    const QueryStringMachine = {

      // @public (read-only) {{key:string, value:{*}, message:string}[]} - cleared by some tests in QueryStringMachineTests.js
      // See QueryStringMachine.addWarning for a description of these fields, and to add warnings.
      warnings: [],

      /**
       * Gets the value for a single query parameter.
       *
       * @param {string} key - the query parameter name
       * @param {Object} schema
       * @returns {*} query parameter value, converted to the proper type
       * @public
       */
      get: function( key, schema ) {
        return this.getForString( key, schema, window.location.search );
      },

      /**
       * Gets values for every query parameter, using the specified schema map.
       *
       * @param {Object} schemaMap - see QueryStringMachine.getAllForString
       * @returns {Object} - see QueryStringMachine.getAllForString
       * @public
       */
      getAll: function( schemaMap ) {
        return this.getAllForString( schemaMap, window.location.search );
      },

      /**
       * Like `get` but for an arbitrary parameter string.
       *
       * @param {string} key - the query parameter name
       * @param {Object} schema - see QueryStringMachine.get
       * @param {string} string - the parameters string.  Must begin with '?' or be the empty string
       * @returns {*} query parameter value, converted to the proper type
       * @public
       */
      getForString: function( key, schema, string ) {

        if ( !isParameterString( string ) ) {
          throw new Error( `Query strings should be either the empty string or start with a "?": ${string}` );
        }

        // Ignore URL values for private query parameters that fail privatePredicate.
        // See https://github.com/phetsims/chipper/issues/743.
        const values = ( schema.private && !privatePredicate() ) ? [] : getValues( key, string );

        validateSchema( key, schema );

        let value = parseValues( key, schema, values );

        if ( schema.hasOwnProperty( 'validValues' ) ) {
          value = getValidValue( isValidValue( value, schema.validValues ), key, value, schema,
            `Invalid value supplied for key "${key}": ${value} is not a member of valid values: ${schema.validValues.join( ', ' )}`
          );
        }

        // isValidValue evaluates to true
        else if ( schema.hasOwnProperty( 'isValidValue' ) ) {
          value = getValidValue( schema.isValidValue( value ), key, value, schema,
            `Invalid value supplied for key "${key}": ${value}`
          );
        }

        let valueValid = TYPES[ schema.type ].isValidValue( value );

        // support custom validation for elementSchema for arrays
        if ( schema.type === 'array' && Array.isArray( value ) ) {
          let elementsValid = true;
          for ( let i = 0; i < value.length; i++ ) {
            const element = value[ i ];
            if ( !TYPES[ schema.elementSchema.type ].isValidValue( element ) ) {
              elementsValid = false;
              break;
            }
            if ( schema.elementSchema.hasOwnProperty( 'isValidValue' ) && !schema.elementSchema.isValidValue( element ) ) {
              elementsValid = false;
              break;
            }
            if ( schema.elementSchema.hasOwnProperty( 'validValues' ) && !isValidValue( element, schema.elementSchema.validValues ) ) {
              elementsValid = false;
              break;
            }
          }
          valueValid = valueValid && elementsValid;
        }

        // dispatch further validation to a type-specific function
        value = getValidValue( valueValid, key, value, schema, `Invalid value for type, key: ${key}` );
        return value;
      },

      /**
       * Like `getAll` but for an arbitrary parameters string.
       * @param {Object} schemaMap - key/value pairs, key is query parameter name and value is a schema
       * @param {string} string - the parameters string
       * @returns {Object} - key/value pairs holding the parsed results
       * @public
       */
      getAllForString: function( schemaMap, string ) {
        const result = {};
        for ( const key in schemaMap ) {
          if ( schemaMap.hasOwnProperty( key ) ) {
            result[ key ] = this.getForString( key, schemaMap[ key ], string );
          }
        }
        return result;
      },

      /**
       * Returns true if the window.location.search contains the given key
       * @param {string} key
       * @returns {boolean} true if the window.location.search contains the given key
       * @public
       */
      containsKey: function( key ) {
        return this.containsKeyForString( key, window.location.search );
      },

      /**
       * Returns true if the given string contains the specified key
       * @param {string} key - the key to check for
       * @param {string} string - the query string to search. Must begin with '?' or be the empty string
       * @returns {boolean} true if the given string contains the given key
       * @public
       */
      containsKeyForString: function( key, string ) {
        if ( !isParameterString( string ) ) {
          throw new Error( `Query strings should be either the empty string or start with a "?": ${string}` );
        }
        const values = getValues( key, string );
        return values.length > 0;
      },

      /**
       * Returns true if the objects are equal.  Exported on the QueryStringMachine for testing.  Only works for
       * arrays objects that contain primitives (i.e. terminals are compared with ===)
       * @param {Object} a - an object to compare
       * @param {Object} b - an object to compare
       * @private - however, it is called from QueryStringMachineTests
       */
      deepEquals: function( a, b ) {
        if ( typeof a !== typeof b ) {
          return false;
        }
        if ( typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean' ) {
          return a === b;
        }
        if ( a === null && b === null ) {
          return true;
        }
        if ( a === undefined && b === undefined ) {
          return true;
        }
        if ( a === null && b === undefined ) {
          return false;
        }
        if ( a === undefined && b === null ) {
          return false;
        }
        const aKeys = Object.keys( a );
        const bKeys = Object.keys( b );
        if ( aKeys.length !== bKeys.length ) {
          return false;
        }
        else if ( aKeys.length === 0 ) {
          return a === b;
        }
        else {
          for ( let i = 0; i < aKeys.length; i++ ) {
            if ( aKeys[ i ] !== bKeys[ i ] ) {
              return false;
            }
            const aChild = a[ aKeys[ i ] ];
            const bChild = b[ aKeys[ i ] ];
            if ( !QueryStringMachine.deepEquals( aChild, bChild ) ) {
              return false;
            }
          }
          return true;
        }
      },

      /**
       * Returns a new URL but without the key-value pair.
       *
       * @param {string} queryString - tail of a URL including the beginning '?' (if any)
       * @param {string} key
       * @public
       */
      removeKeyValuePair: function( queryString, key ) {
        assert && assert( typeof queryString === 'string', `url should be string, but it was: ${typeof queryString}` );
        assert && assert( typeof key === 'string', `url should be string, but it was: ${typeof key}` );
        assert && assert( isParameterString( queryString ), 'queryString should be length 0 or begin with ?' );
        assert && assert( key.length > 0, 'url should be a string with length > 0' );

        if ( queryString.indexOf( '?' ) === 0 ) {
          const newParameters = [];
          const query = queryString.substring( 1 );
          const elements = query.split( '&' );
          for ( let i = 0; i < elements.length; i++ ) {
            const element = elements[ i ];
            const keyAndMaybeValue = element.split( '=' );

            const elementKey = decodeURIComponent( keyAndMaybeValue[ 0 ] );
            if ( elementKey !== key ) {
              newParameters.push( element );
            }
          }

          if ( newParameters.length > 0 ) {
            return `?${newParameters.join( '&' )}`;
          }
          else {
            return '';
          }
        }
        else {
          return queryString;
        }
      },

      /**
       * Remove all the keys from the queryString (ok if they do not appear at all)
       * @param {string} queryString
       * @param {string[]} keys
       * @returns {string}
       * @public
       */
      removeKeyValuePairs: function( queryString, keys ) {
        for ( let i = 0; i < keys.length; i++ ) {
          queryString = this.removeKeyValuePair( queryString, keys[ i ] );
        }
        return queryString;
      },

      /**
       * Appends a query string to a given url.
       * @param {string} url - may or may not already have other query parameters
       * @param {string} queryParameters - may start with '', '?' or '&'
       * @returns {string}
       * @public
       * @static
       *
       * @example
       * // Limit to the second screen
       * simURL = QueryStringMachine.appendQueryString( simURL, 'screens=2' );
       */
      appendQueryString: function( url, queryParameters ) {
        if ( queryParameters.indexOf( '?' ) === 0 || queryParameters.indexOf( '&' ) === 0 ) {
          queryParameters = queryParameters.substring( 1 );
        }
        if ( queryParameters.length === 0 ) {
          return url;
        }
        const combination = url.indexOf( '?' ) >= 0 ? '&' : '?';
        return url + combination + queryParameters;
      },

      /**
       * Helper function for multiple query strings
       * @param {string} url - may or may not already have other query parameters
       * @param {Array.<string>} queryStringArray - each item may start with '', '?', or '&'
       * @returns {string}
       * @public
       * @static
       *
       * @example
       * sourceFrame.src = QueryStringMachine.appendQueryStringArray( simURL, [ 'screens=2', 'frameTitle=source' ] );
       */
      appendQueryStringArray: function( url, queryStringArray ) {

        for ( let i = 0; i < queryStringArray.length; i++ ) {
          url = this.appendQueryString( url, queryStringArray[ i ] );
        }
        return url;
      },

      /**
       * Returns the query string at the end of a url, or '?' if there is none.
       * @param {string} url
       * @returns {string}
       * @public
       */
      getQueryString: function( url ) {
        const index = url.indexOf( '?' );

        if ( index >= 0 ) {
          return url.substring( index );
        }
        else {
          return '?';
        }
      },

      /**
       * Adds a warning to the console and QueryStringMachine.warnings to indicate that the provided invalid value will
       * not be used.
       *
       * @param {string} key - the query parameter name
       * @param {Object} value - type depends on schema type
       * @param {string} message - the message that indicates the problem with the value
       * @public
       */
      addWarning: function( key, value, message ) {
        console.warn( message );

        this.warnings.push( {
          key: key,
          value: value,
          message: message
        } );
      },

      /**
       * Determines if there is a warning for a specified key.
       * @param {string} key
       * @returns {boolean}
       * @public
       */
      hasWarning: function( key ) {
        let hasWarning = false;
        for ( let i = 0; i < this.warnings.length && !hasWarning; i++ ) {
          hasWarning = ( this.warnings[ i ].key === key );
        }
        return hasWarning;
      },

      /**
       * @param {string} queryString - tail of a URL including the beginning '?' (if any)
       * @returns {string[]} - the split up still-URI-encoded parameters (with values if present)
       * @public
       */
      getQueryParametersFromString: function( queryString ) {
        if ( queryString.indexOf( '?' ) === 0 ) {
          const query = queryString.substring( 1 );
          return query.split( '&' );
        }
        return [];
      },

      /**
       * @param {string} key - the query parameter key to return if present
       * @param {string} string - a URL including a "?" if it has a query string
       * @returns {string|null} - the query parameter as it appears in the URL, like `key=VALUE`, or null if not present
       * @public
       */
      getSingleQueryParameterString: function( key, string ) {
        const queryString = this.getQueryString( string );
        const queryParameters = this.getQueryParametersFromString( queryString );

        for ( let i = 0; i < queryParameters.length; i++ ) {
          const queryParameter = queryParameters[ i ];
          const keyAndMaybeValue = queryParameter.split( '=' );

          if ( decodeURIComponent( keyAndMaybeValue[ 0 ] ) === key ) {
            return queryParameter;
          }
        }

        return null;
      }
    };

    /**
     * Query strings may show the same key appearing multiple times, such as ?value=2&value=3.
     * This method recovers all of the string values.  For this example, it would be ['2','3'].
     *
     * @param {string} key - the key for which we are finding values.
     * @param {string} string - the parameters string
     * @returns {Array.<string|null>} - the resulting values, null indicates the query parameter is present with no value
     */
    const getValues = function( key, string ) {
      const values = [];
      const params = string.slice( 1 ).split( '&' );
      for ( let i = 0; i < params.length; i++ ) {
        const splitByEquals = params[ i ].split( '=' );
        const name = splitByEquals[ 0 ];
        const value = splitByEquals.slice( 1 ).join( '=' ); // Support arbitrary number of '=' in the value
        if ( name === key ) {
          if ( value ) {
            values.push( decodeURIComponent( value ) );
          }
          else {
            values.push( null ); // no value provided
          }
        }
      }
      return values;
    };

    // Schema validation ===============================================================================================

    /**
     * Validates the schema for a query parameter.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */
    const validateSchema = function( key, schema ) {

      // type is required
      queryStringMachineAssert( schema.hasOwnProperty( 'type' ), `type field is required for key: ${key}` );

      // type is valid
      queryStringMachineAssert( TYPES.hasOwnProperty( schema.type ), `invalid type: ${schema.type} for key: ${key}` );

      // parse is a function
      if ( schema.hasOwnProperty( 'parse' ) ) {
        queryStringMachineAssert( typeof schema.parse === 'function', `parse must be a function for key: ${key}` );
      }

      // validValues and isValidValue are optional and mutually exclusive
      queryStringMachineAssert( !( schema.hasOwnProperty( 'validValues' ) && schema.hasOwnProperty( 'isValidValue' ) ),
        schema, key, `validValues and isValidValue are mutually exclusive for key: ${key}` );

      // validValues is an Array
      if ( schema.hasOwnProperty( 'validValues' ) ) {
        queryStringMachineAssert( Array.isArray( schema.validValues ), `isValidValue must be an array for key: ${key}` );
      }

      // isValidValue is a function
      if ( schema.hasOwnProperty( 'isValidValue' ) ) {
        queryStringMachineAssert( typeof schema.isValidValue === 'function', `isValidValue must be a function for key: ${key}` );
      }

      // defaultValue has the correct type
      if ( schema.hasOwnProperty( 'defaultValue' ) ) {
        queryStringMachineAssert( TYPES[ schema.type ].isValidValue( schema.defaultValue ), `defaultValue incorrect type: ${key}` );
      }

      // validValues have the correct type
      if ( schema.hasOwnProperty( 'validValues' ) ) {
        schema.validValues.forEach( value => queryStringMachineAssert( TYPES[ schema.type ].isValidValue( value ), `validValue incorrect type for key: ${key}` ) );
      }

      // defaultValue is a member of validValues
      if ( schema.hasOwnProperty( 'defaultValue' ) && schema.hasOwnProperty( 'validValues' ) ) {
        queryStringMachineAssert( isValidValue( schema.defaultValue, schema.validValues ), schema,
          key, `defaultValue must be a member of validValues, for key: ${key}` );
      }

      // defaultValue must exist for a public schema so there's a fallback in case a user provides an invalid value.
      // However, defaultValue is not required for flags since they're only a key. While marking a flag as public: true
      // doesn't change its behavior, it's allowed so that we can use the public key for documentation, see https://github.com/phetsims/query-string-machine/issues/41
      if ( schema.hasOwnProperty( 'public' ) && schema.public && schema.type !== 'flag' ) {
        queryStringMachineAssert( schema.hasOwnProperty( 'defaultValue' ), `defaultValue is required when public: true for key: ${key}` );
      }

      // verify that the schema has appropriate properties
      validateSchemaProperties( key, schema, TYPES[ schema.type ].required, TYPES[ schema.type ].optional );

      // dispatch further validation to an (optional) type-specific function
      if ( TYPES[ schema.type ].validateSchema ) {
        TYPES[ schema.type ].validateSchema( key, schema );
      }
    };

    /**
     * Validates schema for type 'array'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     */
    const validateArraySchema = function( key, schema ) {

      // separator is a single character
      if ( schema.hasOwnProperty( 'separator' ) ) {
        queryStringMachineAssert( typeof schema.separator === 'string' && schema.separator.length === 1, `invalid separator: ${schema.separator}, for key: ${key}` );
      }

      queryStringMachineAssert( !schema.elementSchema.hasOwnProperty( 'public' ), 'Array elements should not declare public; it comes from the array schema itself.' );

      // validate elementSchema
      validateSchema( `${key}.element`, schema.elementSchema );
    };

    /**
     * Verifies that a schema contains only supported properties, and contains all required properties.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string[]} requiredProperties - properties that the schema must have
     * @param {string[]} optionalProperties - properties that the schema may optionally have
     */
    const validateSchemaProperties = function( key, schema, requiredProperties, optionalProperties ) {

      // {string[]}, the names of the properties in the schema
      const schemaProperties = Object.getOwnPropertyNames( schema );

      // verify that all required properties are present
      requiredProperties.forEach( property => {
        queryStringMachineAssert( schemaProperties.indexOf( property ) !== -1, `missing required property: ${property} for key: ${key}` );
      } );

      // verify that there are no unsupported properties
      const supportedProperties = requiredProperties.concat( optionalProperties );
      schemaProperties.forEach( property => {
        queryStringMachineAssert( property === 'type' || supportedProperties.indexOf( property ) !== -1, `unsupported property: ${property} for key: ${key}` );
      } );
    };

    // Parsing =========================================================================================================

    /**
     * Uses the supplied schema to convert query parameter value(s) from string to the desired value type.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {Array.<string|null|undefined>} values - any matches from the query string,
     *   could be multiple for ?value=x&value=y for example
     * @returns {*} the associated value, converted to the proper type
     */
    const parseValues = function( key, schema, values ) {
      let returnValue;

      // values contains values for all occurrences of the query parameter.  We currently support only 1 occurrence.
      queryStringMachineAssert( values.length <= 1, `query parameter cannot occur multiple times: ${key}` );

      if ( schema.type === 'flag' ) {

        // flag is a convenient variation of boolean, which depends on whether the query string is present or not
        returnValue = TYPES[ schema.type ].parse( key, schema, values[ 0 ] );
      }
      else {
        queryStringMachineAssert( values[ 0 ] !== undefined || schema.hasOwnProperty( 'defaultValue' ),
          `missing required query parameter: ${key}` );
        if ( values[ 0 ] === undefined ) {

          // not in the query string, use the default
          returnValue = schema.defaultValue;
        }
        else {

          // dispatch parsing of query string to a type-specific function
          returnValue = TYPES[ schema.type ].parse( key, schema, values[ 0 ] );
        }
      }

      return returnValue;
    };

    /**
     * Parses the value for a type 'flag'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {null|undefined|string} value - value from the query parameter string
     * @returns {boolean|string}
     */
    const parseFlag = function( key, schema, value ) {
      return value === null ? true : value === undefined ? false : value;
    };

    /**
     * Parses the value for a type 'boolean'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string|null} string - value from the query parameter string
     * @returns {boolean|string|null}
     */
    const parseBoolean = function( key, schema, string ) {
      return string === 'true' ? true : string === 'false' ? false : string;
    };

    /**
     * Parses the value for a type 'number'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string|null} string - value from the query parameter string
     * @returns {number|string|null}
     */
    const parseNumber = function( key, schema, string ) {
      const number = Number( string );
      return string === null || isNaN( number ) ? string : number;
    };

    /**
     * Parses the value for a type 'number'.
     * The value to be parsed is already string, so it is guaranteed to parse as a string.
     * @param {string} key
     * @param {Object} schema
     * @param {string|null} string
     * @returns {string|null}
     */
    const parseString = function( key, schema, string ) {
      return string;
    };

    /**
     * Parses the value for a type 'array'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string|null} value - value from the query parameter string
     * @returns {Array.<*>|null}
     */
    const parseArray = function( key, schema, value ) {

      let returnValue;

      if ( value === null ) {

        // null signifies an empty array. For instance ?screens= would give []
        // See https://github.com/phetsims/query-string-machine/issues/17
        returnValue = [];
      }
      else {

        // Split up the string into an array of values. E.g. ?screens=1,2 would give [1,2]
        returnValue = value.split( schema.separator || DEFAULT_SEPARATOR )
          .map( element => parseValues( key, schema.elementSchema, [ element ] ) );
      }

      return returnValue;
    };

    /**
     * Parses the value for a type 'custom'.
     * @param {string} key - the query parameter name
     * @param {Object} schema - schema that describes the query parameter, see QueryStringMachine.get
     * @param {string} value - value from the query parameter string
     * @returns {*}
     */
    const parseCustom = function( key, schema, value ) {
      return schema.parse( value );
    };

    // Utilities =======================================================================================================

    /**
     * Determines if value is in a set of valid values, uses deep comparison.
     * @param {*} value
     * @param {Array.<*>} validValues
     * @returns {boolean}
     */
    const isValidValue = function( value, validValues ) {
      let found = false;
      for ( let i = 0; i < validValues.length && !found; i++ ) {
        found = QueryStringMachine.deepEquals( validValues[ i ], value );
      }
      return found;
    };

    /**
     * Query parameters are specified by the user, and are outside the control of the programmer.
     * So the application should throw an Error if query parameters are invalid.
     * @param {boolean} predicate - if predicate evaluates to false, an Error is thrown
     * @param {string} message
     */
    const queryStringMachineAssert = function( predicate, message ) {
      if ( !predicate ) {
        console && console.log && console.log( message );
        throw new Error( `Query String Machine Assertion failed: ${message}` );
      }
    };

    //==================================================================================================================

    /**
     * Data structure that describes each query parameter type, which properties are required vs optional,
     * how to validate, and how to parse.
     *
     * The properties that are required or optional depend on the type (see TYPES), and include:
     * type - {string} the type name
     * defaultValue - the value to use if no query parameter is provided. If there is no defaultValue, then
     *    the query parameter is required in the query string; omitting the query parameter will result in an Error.
     * validValues - array of the valid values for the query parameter
     * isValidValue - function that takes a parsed Object (not string) and checks if it is acceptable
     * elementSchema - specifies the schema for elements in an array
     * separator -  array elements are separated by this string, defaults to `,`
     * parse - a function that takes a string and returns an Object
     */
    const TYPES = {
      // NOTE: Types for this are currently in phet-types.d.ts! Changes here should be made there also

      // value is true if present, false if absent
      flag: {
        required: [],
        optional: [ 'private', 'public' ],
        validateSchema: null, // no type-specific schema validation
        parse: parseFlag,
        isValidValue: value => value === true || value === false,
        defaultValue: true // only needed for flags marks as 'public: true`
      },

      // value is either true or false, e.g. showAnswer=true
      boolean: {
        required: [],
        optional: [ 'defaultValue', 'private', 'public' ],
        validateSchema: null, // no type-specific schema validation
        parse: parseBoolean,
        isValidValue: value => value === true || value === false
      },

      // value is a number, e.g. frameRate=100
      number: {
        required: [],
        optional: [ 'defaultValue', 'validValues', 'isValidValue', 'private', 'public' ],
        validateSchema: null, // no type-specific schema validation
        parse: parseNumber,
        isValidValue: value => typeof value === 'number' && !isNaN( value )
      },

      // value is a string, e.g. name=Ringo
      string: {
        required: [],
        optional: [ 'defaultValue', 'validValues', 'isValidValue', 'private', 'public' ],
        validateSchema: null, // no type-specific schema validation
        parse: parseString,
        isValidValue: value => value === null || typeof value === 'string'
      },

      // value is an array, e.g. screens=1,2,3
      array: {
        required: [ 'elementSchema' ],
        optional: [ 'defaultValue', 'validValues', 'isValidValue', 'separator', 'validValues', 'private', 'public' ],
        validateSchema: validateArraySchema,
        parse: parseArray,
        isValidValue: value => Array.isArray( value ) || value === null
      },

      // value is a custom data type, e.g. color=255,0,255
      custom: {
        required: [ 'parse' ],
        optional: [ 'defaultValue', 'validValues', 'isValidValue', 'private', 'public' ],
        validateSchema: null, // no type-specific schema validation
        parse: parseCustom,
        isValidValue: value => {

          // TODO do we need to add a property to 'custom' schema that handles validation of custom value's type? see https://github.com/phetsims/query-string-machine/issues/35
          return true;
        }
      }
    };

    return QueryStringMachine;
  } )();
} ) );