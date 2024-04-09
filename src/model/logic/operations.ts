import { Formula } from './Formula.ts';
// @ts-expect-error
import Logic from '../solver/logic-solver/logic-solver.js';
import { Term } from './Term.ts';
import { Combination } from 'phet-lib/dot';
import _ from '../../workarounds/_.ts';

const toLogicParameter = <T>( parameter: Formula<T> ): unknown => {
  if ( parameter instanceof Term ) {
    return parameter.name;
  }
  else {
    return parameter.logic;
  }
};

export const logicTrue: Formula<any> = {
  type: 'true',
  logic: Logic.TRUE,
  parameters: []
};

export const logicFalse: Formula<any> = {
  type: 'false',
  logic: Logic.FALSE,
  parameters: []
};

export const logicOr = <T>( formulas: Formula<T>[] ): Formula<T> => {
  return {
    type: 'or',
    logic: Logic.or( ...formulas.map( toLogicParameter ) ),
    parameters: formulas
  };
};

export const logicAnd = <T>( formulas: Formula<T>[] ): Formula<T> => {
  return {
    type: 'and',
    logic: Logic.and( ...formulas.map( toLogicParameter ) ),
    parameters: formulas
  };
};

export const logicNot = <T>( formula: Formula<T> ): Formula<T> => {
  return {
    type: 'not',
    logic: Logic.not( toLogicParameter( formula ) ),
    parameters: [ formula ]
  };
};

export const logicExactlyOne = <T>( formulas: Formula<T>[] ): Formula<T> => {
  return {
    type: 'exactly-one',
    logic: Logic.exactlyOne( ...formulas.map( toLogicParameter ) ),
    parameters: formulas
  };
};

export const logicNone = <T>( formulas: Formula<T>[] ): Formula<T> => {
  return logicAnd( formulas.map( formula => logicNot( formula ) ) );
};

export const logicSome = logicOr;

export const logicNotAll = <T>( formulas: Formula<T>[] ): Formula<T> => {
  return logicOr( formulas.map( formula => logicNot( formula ) ) );
};

export const logicAtLeastN = <T>( formulas: Formula<T>[], n: number ): Formula<T> => {
  if ( n > 0 ) {
    const conditions = [
      logicSome( formulas )
    ];
    Combination.forEachCombination( formulas, ( combination: readonly Formula<T>[] ) => {
      if ( combination.length === formulas.length - n + 1 ) {
        // TODO: is this... horrible?
        conditions.push(
          logicNot( logicAnd( combination.map( formula => logicNot( formula ) ) ) )
        );
      }
    } );
    return logicAnd( conditions );
  }
  else {
    return logicTrue;
  }
};

export const logicAtMostN = <T>( formulas: Formula<T>[], n: number ): Formula<T> => {
  const conditions: Formula<T>[] = [];

  Combination.forEachCombination( formulas, ( combination: readonly Formula<T>[] ) => {
    if ( combination.length === n + 1 ) {
      conditions.push( logicOr( combination.map( formula => logicNot( formula ) ) ) );
    }
  } );

  return logicAnd( conditions );
};

export const logicNot1 = <T>( formulas: Formula<T>[] ): Formula<T> => {
  // TODO: see if it's better if we manually add the implications (e.g. for every permutation of 2, ( A or NOT B ))
  return logicNot( logicExactlyOne( formulas ) );
};

export const logicZeroOrTwo = <T>( formulas: Formula<T>[] ): Formula<T> => {
  return logicAnd( [
    logicAtMostN( formulas, 2 ),
    logicNot1( formulas )
  ] );
};

export const logicExactlyN = <T>( formulas: Formula<T>[], n: number ): Formula<T> => {
  if ( n === 0 ) {
    return logicNone( formulas );
  }
  else {
    return logicAnd( [
      logicAtLeastN( formulas, n ),
      logicAtMostN( formulas, n )
    ] );
  }
};

export const logicPossibleCounts = <T>( formulas: Formula<T>[], possibleCounts: number[] ): Formula<T> => {
  return logicOr( possibleCounts.map( count => {
    if ( count === 0 ) {
      return logicAnd( formulas.map( formula => logicNot( formula ) ) );
    }
    else if ( count === formulas.length ) {
      return logicAnd( formulas );
    }
    else {
      return logicExactlyN( formulas, count );
    }
  } ) );
};

export const logicEven = <T>( formulas: Formula<T>[] ): Formula<T> => {
  return logicPossibleCounts( formulas, _.range( 0, formulas.length + 1 ).filter( count => count % 2 === 0 ) );
};

export const logicOdd = <T>( formulas: Formula<T>[] ): Formula<T> => {
  return logicPossibleCounts( formulas, _.range( 0, formulas.length + 1 ).filter( count => count % 2 === 1 ) );
};
