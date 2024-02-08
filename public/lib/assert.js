// Copyright 2013-2023, University of Colorado Boulder

/*
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

( function() {


  window.assertions = window.assertions || {};
  window.assertions.assertFunction = window.assertions.assertFunction || function( predicate, ...messages ) {
    if ( !predicate ) {

      // don't treat falsey as a message.
      messages = messages.filter( message => !!messages );

      // Log the stack trace to IE.  Just creating an Error is not enough, it has to be caught to get a stack.
      if ( window.navigator && window.navigator.appName === 'Microsoft Internet Explorer' ) {
        messages.push( `stack=\n${new Error().stack}` );
      }

      // Add "Assertion Failed" to the front of the message list
      const assertPrefix = messages.length > 0 ? 'Assertion failed: ' : 'Assertion failed';
      console && console.error && console.error( assertPrefix, ...messages );
      if ( window.QueryStringMachine && QueryStringMachine.containsKey( 'debugger' ) ) {
        debugger; // eslint-disable-line no-debugger
      }
      throw new Error( assertPrefix + messages.join( '\n ' ) );
    }
  };

  window.assert = window.assert || null;
  window.assertSlow = window.assertSlow || null;

  window.assertions.enableAssert = function() {
    window.assert = window.assertions.assertFunction;
    window.console && window.console.log && window.console.log( 'enabling assert' );
  };
  window.assertions.disableAssert = function() {
    window.assert = null;
    window.console && window.console.log && window.console.log( 'disabling assert' );
  };

  window.assertions.enableAssertSlow = function() {
    window.assertSlow = window.assertions.assertFunction;
    window.console && window.console.log && window.console.log( 'enabling assertSlow' );
  };
  window.assertions.disableAssertSlow = function() {
    window.assertSlow = null;
    window.console && window.console.log && window.console.log( 'disabling assertSlow' );
  };
} )();
