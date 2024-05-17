interface CDCLClause {
  literals: number[];
}

interface CDCLAssignment {
  variable: number;
  value: boolean;
}

class DeprecatedCDCLSATSolver {
  private clauses: CDCLClause[];
  private numVar: number;
  private numClauses: number;
  private assignment: CDCLAssignment[];
  private decidePos: number[];
  private counter: Map<number, number>;
  private literalWatch: Map<number, number[]>;
  private clausesLiteralWatched: number[][];
  private probability: number;
  private back: CDCLAssignment[];
  private restartCount: number;
  private learnedCount: number;
  private decideCount: number;
  private impCount: number;

  constructor( clauses: CDCLClause[], numVar: number ) {
    this.clauses = clauses;
    this.numVar = numVar;
    this.numClauses = clauses.length;
    this.assignment = [];
    this.decidePos = [];
    this.counter = this.VSIDSInit( clauses, numVar );
    this.literalWatch = new Map();
    this.clausesLiteralWatched = [];
    this.probability = 0.9;
    this.back = [ ...this.assignment ];
    this.restartCount = 0;
    this.learnedCount = 0;
    this.decideCount = 0;
    this.impCount = 0;
    this.initializeWatchList();
  }

  private VSIDSInit( clauses: CDCLClause[], numVar: number ): Map<number, number> {
    const counter = new Map<number, number>();
    for ( let x = -numVar; x <= numVar; x++ ) {
      counter.set( x, 0 );
    }
    for ( const clause of clauses ) {
      for ( const literal of clause.literals ) {
        counter.set( literal, ( counter.get( literal ) || 0 ) + 1 );
      }
    }
    return counter;
  }

  private VSIDSConflict( counter: Map<number, number>, conflictClause: CDCLClause ): void {
    for ( const literal of conflictClause.literals ) {
      counter.set( literal, ( counter.get( literal ) || 0 ) + 1 );
    }
  }

  private VSIDSDecay( counter: Map<number, number>, numVar: number ): void {
    for ( let i = -numVar; i <= numVar; i++ ) {
      counter.set( i, ( counter.get( i ) || 0 ) * 0.95 );
    }
  }

  private VSIDSDecide( counter: Map<number, number>, assignment: CDCLAssignment[], numVar: number ): number {
    let max = 0;
    let variable = 0;
    for ( let x = -numVar; x <= numVar; x++ ) {
      if ( ( counter.get( x ) || 0 ) >= max && !assignment.some( a => a.variable === Math.abs( x ) ) ) {
        max = counter.get( x ) || 0;
        variable = x;
      }
    }
    return variable;
  }

  private initializeWatchList(): void {
    for ( let i = -this.numVar; i <= this.numVar; i++ ) {
      this.literalWatch.set( i, [] );
    }
    for ( let i = 0; i < this.clauses.length; i++ ) {
      const clause = this.clauses[ i ];
      let A = clause.literals[ 0 ];
      let B = clause.literals[ 1 ];
      this.literalWatch.get( A )!.push( i );
      this.literalWatch.get( B )!.push( i );
      this.clausesLiteralWatched.push( [ A, B ] );
    }
  }

  private twoWatchPropagate( variable: number ): [ CDCLClause | null, Map<number, number[]> ] {
    const propList = [ variable ];
    while ( propList.length > 0 ) {
      const variable = propList.pop()!;
      for ( const affectedClauseNum of this.literalWatch.get( -variable ) || [] ) {
        const affectedClause = this.clauses[ affectedClauseNum ];
        let [ A, B ] = this.clausesLiteralWatched[ affectedClauseNum ];
        const [ status, newA, newB, unit ] = this.checkStatus( affectedClause, A, B );
        if ( status === 'Unit' ) {
          propList.push( unit );
          this.assignment.push( { variable: Math.abs( unit ), value: unit > 0 } );
        }
        else if ( status === 'Unsatisfied' ) {
          return [ affectedClause, this.literalWatch ];
        }
        this.literalWatch.get( A )!.splice( this.literalWatch.get( A )!.indexOf( affectedClauseNum ), 1 );
        this.literalWatch.get( B )!.splice( this.literalWatch.get( B )!.indexOf( affectedClauseNum ), 1 );
        this.clausesLiteralWatched[ affectedClauseNum ] = [ newA, newB ];
        this.literalWatch.get( newA )!.push( affectedClauseNum );
        this.literalWatch.get( newB )!.push( affectedClauseNum );
      }
    }
    return [ null, this.literalWatch ];
  }

  private checkStatus( clause: CDCLClause, A: number, B: number ): [ string, number, number, number ] {
    let unit = 0;
    if ( this.assignment.some( a => a.variable === Math.abs( A ) && a.value === ( A > 0 ) ) ||
         this.assignment.some( a => a.variable === Math.abs( B ) && a.value === ( B > 0 ) ) ) {
      return [ 'Satisfied', A, B, unit ];
    }
    const sym: number[] = [];
    for ( const literal of clause.literals ) {
      if ( !this.assignment.some( a => a.variable === Math.abs( literal ) && a.value !== ( literal > 0 ) ) ) {
        sym.push( literal );
      }
      if ( this.assignment.some( a => a.variable === Math.abs( literal ) && a.value === ( literal > 0 ) ) ) {
        return [ 'Satisfied', A, literal, unit ];
      }
    }
    if ( sym.length === 1 ) {
      return [ 'Unit', A, B, sym[ 0 ] ];
    }
    if ( sym.length === 0 ) {
      return [ 'Unsatisfied', A, B, unit ];
    }
    return [ 'Unresolved', sym[ 0 ], sym[ 1 ], unit ];
  }

  private backjump( decLevel: number ): [ number, number, number ] {
    const impCount = this.impCount + this.assignment.length - this.decidePos.length;
    if ( this.decidePos.length === 0 ) {
      return [ -1, -1, impCount ];
    }
    decLevel = this.decidePos.pop()!;
    const literal = this.assignment[ decLevel ].variable;
    this.assignment.splice( decLevel );
    return [ 0, -literal, impCount ];
  }

  private addLearnedClauseTo( learnedClause: CDCLClause ): [ number, number ] {
    if ( learnedClause.literals.length === 0 ) {
      return [ -1, 0 ];
    }
    if ( learnedClause.literals.length === 1 ) {
      this.assignment.push( { variable: Math.abs( learnedClause.literals[ 0 ] ), value: learnedClause.literals[ 0 ] > 0 } );
      return [ 1, learnedClause.literals[ 0 ] ];
    }
    this.clauses.push( learnedClause );
    const A = learnedClause.literals[ 0 ];
    const B = learnedClause.literals[ 1 ];
    const i = this.clauses.length - 1;
    this.clausesLiteralWatched.push( [ A, B ] );
    this.literalWatch.get( A )!.push( i );
    this.literalWatch.get( B )!.push( i );
    return [ 0, 0 ];
  }

  private randomRestart(): void {
    if ( Math.random() < this.probability ) {
      this.assignment = [ ...this.back ];
      this.decidePos = [];
      this.probability *= 0.5;
      this.restartCount += 1;
      if ( this.probability < 0.001 ) {
        this.probability = 0.2;
      }
      if ( this.restartCount > this.assignment.length + 10 ) {
        this.probability = 0;
      }
    }
  }

  private verify(): boolean {
    for ( const clause of this.clauses ) {
      if ( !clause.literals.some( lit => this.assignment.some( a => a.variable === Math.abs( lit ) && a.value === ( lit > 0 ) ) ) ) {
        return false;
      }
    }
    return true;
  }

  private analyzeConflict( conflict: CDCLClause ): CDCLClause {
    const learn: number[] = [];
    for ( const pos of this.decidePos ) {
      learn.push( -this.assignment[ pos ].variable );
    }
    return { literals: learn };
  }

  private allVarsAssigned(): boolean {
    return this.assignment.length >= this.numVar;
  }

  private assign( variable: number ): void {
    this.decidePos.push( this.assignment.length );
    this.assignment.push( { variable: Math.abs( variable ), value: variable > 0 } );
  }

  public solve(): CDCLAssignment[] | string {
    let clauses = this.unitPropagation();
    if ( clauses === -1 ) {
      return 'UNSAT';
    }
    while ( !this.allVarsAssigned() ) {
      const variable = this.VSIDSDecide( this.counter, this.assignment, this.numVar );
      this.decideCount += 1;
      this.assign( variable );
      let [ conflict, literalWatch ] = this.twoWatchPropagate( variable );
      while ( conflict ) {
        this.VSIDSConflict( this.counter, conflict );
        this.VSIDSDecay( this.counter, this.numVar );
        const learnedClause = this.analyzeConflict( conflict );
        const [ status, unit ] = this.addLearnedClauseTo( learnedClause );
        this.learnedCount += 1;
        if ( status === -1 ) {
          return 'UNSAT';
        }
        const [ jumpStatus, varBack, impCount ] = this.backjump( unit );
        this.impCount = impCount;
        if ( jumpStatus === -1 ) {
          return 'UNSAT';
        }
        this.assignment.push( { variable: Math.abs( varBack ), value: varBack > 0 } );
        this.randomRestart();
        [ conflict, literalWatch ] = this.twoWatchPropagate( varBack );
      }
    }
    return this.assignment;
  }

  private unitPropagation(): CDCLClause[] | number {
    const newClauses = [ ...this.clauses ];
    while ( true ) {
      let foundUnit = false;
      for ( const clause of newClauses ) {
        if ( clause.literals.length === 1 ) {
          const unit = clause.literals[ 0 ];
          const newClausesAfterBCP = this.bcp( newClauses, unit );
          if ( newClausesAfterBCP === -1 ) {
            return -1;
          }
          this.assignment.push( { variable: Math.abs( unit ), value: unit > 0 } );
          foundUnit = true;
          break;
        }
      }
      if ( !foundUnit ) {
        break;
      }
    }
    return newClauses;
  }

  private bcp( clauses: CDCLClause[], literal: number ): CDCLClause[] | number {
    const newClauses = clauses.filter( c => !c.literals.includes( literal ) ).map( c => ( {
      literals: c.literals.filter( l => l !== -literal )
    } ) );
    if ( newClauses.some( c => c.literals.length === 0 ) ) {
      return -1;
    }
    return newClauses;
  }
}

// Main function
function main() {

  const numVar = 16;
  const clauses = [
    { literals: [ 1, 2 ] },
    { literals: [ -2, -4 ] },
    { literals: [ 3, 4 ] },
    { literals: [ -4, -5 ] },
    { literals: [ 5, -6 ] },
    { literals: [ 6, -7 ] },
    { literals: [ 6, 7 ] },
    { literals: [ 7, -16 ] },
    { literals: [ 8, -9 ] },
    { literals: [ -8, -14 ] },
    { literals: [ 9, 10 ] },
    { literals: [ 9, -10 ] },
    { literals: [ -10, -11 ] },
    { literals: [ 10, 12 ] },
    { literals: [ 11, 12 ] },
    { literals: [ 13, 14 ] },
    { literals: [ 14, -15 ] },
    { literals: [ 15, 16 ] },
  ];

// 1 2
// -2 -4
// 3 4
// -4 -5
// 5 -6
// 6 -7
// 6 7
// 7 -16
// 8 -9
// -8 -14
// 9 10
// 9 -10
// -10 -11
// 10 12
// 11 12
// 13 14
// 14 -15
// 15 16

//   const [ numVar, numClauses, clauses ] = readClauses( `c  quinn.cnf
// c
// p cnf 16 18
//   1    2  0
//  -2   -4  0
//   3    4  0
//  -4   -5  0
//   5   -6  0
//   6   -7  0
//   6    7  0
//   7  -16  0
//   8   -9  0
//  -8  -14  0
//   9   10  0
//   9  -10  0
// -10  -11  0
//  10   12  0
//  11   12  0
//  13   14  0
//  14  -15  0
//  15   16  0` );
  const solver = new DeprecatedCDCLSATSolver( clauses, numVar );
  const startSolve = Date.now();
  const result = solver.solve();
  const endSolve = Date.now();

  console.log( 'Result:' );
  console.log( '=============================================' );
  console.log( '# Restarts : ' + solver.restartCount );
  console.log( '# Learned Clauses : ' + solver.learnedCount );
  console.log( '# Decisions : ' + solver.decideCount );
  console.log( '# Implications : ' + solver.impCount );
  console.log( '# Solve time : ' + ( endSolve - startSolve ) / 1000 + ' sec' );
  console.log( '=============================================' );

  if ( result === 'UNSAT' ) {
    console.log( 'UNSAT' );
  }
  else {
    console.log( 'SAT' );
    const assignment = ( result as CDCLAssignment[] ).map( a => ( a.value ? a.variable : -a.variable ) ).sort( ( a, b ) => Math.abs( a ) - Math.abs( b ) );
    console.log( 'Assignment:', assignment );
  }
}

main();