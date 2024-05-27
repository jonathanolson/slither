import { PatternRule } from '../../model/pattern/pattern-rule/PatternRule.ts';
import { Panel } from 'phet-lib/sun';
import { AlignBox, HBox, Node, NodeOptions, Text, VBox } from 'phet-lib/scenery';
import { planarPatternMaps } from '../../model/pattern/pattern-board/planar-map/planarPatternMaps.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { PatternRuleNode } from './PatternRuleNode.ts';
import { PatternBoardSolver } from '../../model/pattern/solve/PatternBoardSolver.ts';
import { TPatternEdge } from '../../model/pattern/pattern-board/TPatternEdge.ts';
import { FeatureSet } from '../../model/pattern/feature/FeatureSet.ts';
import { FaceFeature } from '../../model/pattern/feature/FaceFeature.ts';
import { BinaryFeatureMap } from '../../model/pattern/generation/BinaryFeatureMap.ts';
import { RichSolution } from '../../model/pattern/solve/RichSolution.ts';
import { Highlander } from '../../model/pattern/highlander/Highlander.ts';
import { arrayRemove, optionize } from 'phet-lib/phet-core';
import { IncompatibleFeatureError } from '../../model/pattern/feature/IncompatibleFeatureError.ts';
import { PatternNode } from './PatternNode.ts';
import _ from '../../workarounds/_.ts';
import { TPuzzleStyle } from '../puzzle/TPuzzleStyle.ts';
import { getClassicPuzzleStyleWithTheme, getSectorsWithColorsPuzzleStyleWithTheme } from '../puzzle/puzzleStyles.ts';
import { DisplayTiling } from './DisplayTiling.ts';
import { getBestDisplayEmbedding } from './getBestDisplayEmbedding.ts';
import { EmbeddedPatternRuleNode } from './EmbeddedPatternRuleNode.ts';
import { BlackEdgeFeature } from '../../model/pattern/feature/BlackEdgeFeature.ts';
import { RedEdgeFeature } from '../../model/pattern/feature/RedEdgeFeature.ts';
import { DisplayEmbedding } from '../../model/pattern/embedding/DisplayEmbedding.ts';
import { darkTheme, lightTheme } from '../Theme.ts';

type SelfOptions = {
  layoutWidth?: number;
};

export type PatternRuleAnalysisNodeOptions = NodeOptions & SelfOptions;

const solutionScale = 0.5;

const lightClassicPuzzleStyle = getClassicPuzzleStyleWithTheme( lightTheme );
const darkAllPuzzleStyle = getSectorsWithColorsPuzzleStyleWithTheme( darkTheme );

export class PatternRuleAnalysisNode extends Node {
  public constructor(
    public readonly rule: PatternRule,
    providedOptions?: PatternRuleAnalysisNodeOptions,
  ) {

    const options = optionize<PatternRuleAnalysisNodeOptions, SelfOptions, NodeOptions>()( {
      layoutWidth: 1000,
    }, providedOptions );

    const container = new VBox( {
      x: 10,
      y: 10,
      align: 'left'
    } );

    const addPaddedNode = ( node: Node ) => {
      container.addChild( new AlignBox( node, { margin: 5 } ) );
    };

    const patternBoard = rule.patternBoard;
    const planarPatternMap = planarPatternMaps.get( patternBoard )!;
    assertEnabled() && assert( planarPatternMap );

    const addHeader = ( text: string, topMargin = 20 ) => {
      container.addChild( new AlignBox( new Text( text, {
        font: 'bold 20px Arial',
        fill: '#ccc',
        tagName: 'h1',
      } ), { topMargin: topMargin } ) );
    };

    // Rule
    {
      addHeader( `Generic Rule${rule.highlander ? ' (Highlander)' : ''}`, 0 );
      addPaddedNode( new PatternRuleNode( rule, planarPatternMap ) );
    }

    // Solutions
    {
      const directSolutions = PatternBoardSolver.getSolutions( patternBoard, rule.inputFeatureSet.getFeaturesArray() );

      const solutionToDisplayFeatureSet = ( solution: TPatternEdge[] ): FeatureSet => {
        const featureSet = FeatureSet.empty( patternBoard );

        rule.inputFeatureSet.getFeaturesArray().forEach( inputFeature => {
          if ( inputFeature instanceof FaceFeature ) {
            featureSet.addFeature( inputFeature );
          }
        } );

        patternBoard.edges.forEach( edge => {
          if ( !edge.isExit ) {
            if ( solution.includes( edge ) ) {
              featureSet.addBlackEdge( edge );
            }
            else {
              featureSet.addRedEdge( edge );
            }
          }
        } );

        return featureSet;
      };

      if ( rule.highlander ) {
        const binaryFeatureMap = new BinaryFeatureMap( patternBoard, {
          solveEdges: true,
          solveSectors: false,
          solveFaceColors: false
        } );
        const widerSolutions = PatternBoardSolver.getSolutions( patternBoard, rule.inputFeatureSet.getHighlanderFeaturesArray() );
        const widerRichSolutions = widerSolutions.map( solution => new RichSolution( patternBoard, binaryFeatureMap, solution, true ) );

        const highlanderFilteredRichSolutions = Highlander.filterWithFeatureSet( widerRichSolutions, rule.inputFeatureSet );

        const highlanderFinalRichSolutions = highlanderFilteredRichSolutions.filter( richSolution => {
          return richSolution.isCompatibleWithFeatureSet( rule.inputFeatureSet );
        } );

        const filteredSolutions = directSolutions.slice();
        highlanderFinalRichSolutions.forEach( richSolution => {
          const solution = filteredSolutions.find( solution => {
            return solution.length === richSolution.solution.length && solution.every( edge => richSolution.solutionSet.has( edge ) );
          } )!;

          assertEnabled() && assert( solution );

          // TODO: performance (if it matters)
          arrayRemove( filteredSolutions, solution );
        } );

        const highlanderMap = new Map<string, RichSolution[]>;

        widerRichSolutions.forEach( richSolution => {
          // TODO: efficiency
          const key = Highlander.getHighlanderKeyWithFeatureSet( richSolution, rule.inputFeatureSet );
          if ( highlanderMap.has( key ) ) {
            highlanderMap.get( key )!.push( richSolution );
          }
          else {
            highlanderMap.set( key, [ richSolution ] );
          }
        } );

        const highlanderArrays = _.sortBy( [ ...highlanderMap.values() ], arr => -arr.length );
        const filteredHighlanderArrays = highlanderArrays.filter( arr => arr.length > 1 );
        const singleHighlanderSolutions = highlanderArrays.filter( arr => arr.length === 1 ).map( arr => arr[ 0 ] );

        const matchingSingleHighlanderSolutions: RichSolution[] = [];
        const nonMatchingSingleHighlanderSolutions: RichSolution[] = [];

        // TODO: improve, lazy
        singleHighlanderSolutions.forEach( solution => {
          const testFeatureSet = rule.inputFeatureSet.clone();

          try {
            // TODO: omg
            solution.solution.forEach( blackEdge => {
              testFeatureSet.addBlackEdge( blackEdge );
            } );

            patternBoard.edges.forEach( edge => {
              if ( !solution.solutionSet.has( edge ) ) {
                testFeatureSet.addRedEdge( edge );
              }
            } );

            matchingSingleHighlanderSolutions.push( solution );
          }
          catch ( e ) {
            if ( e instanceof IncompatibleFeatureError ) {
              nonMatchingSingleHighlanderSolutions.push( solution );
            }
            else {
              throw e;
            }
          }
        } );

        addHeader( 'Valid Solutions' );

        container.addChild( new AlignBox( new HBox( {
          spacing: 5,
          wrap: true,
          justify: 'left',
          lineSpacing: 30,
          preferredWidth: options.layoutWidth,
          children: [
            ...matchingSingleHighlanderSolutions.map( solution => new PatternNode( patternBoard, solutionToDisplayFeatureSet( solution.solution ), planarPatternMap, {
              scale: solutionScale,
            } ) ),
          ]
        } ), { margin: 5 } ) );

        addHeader( 'Highlander Duplicates (Invalid)' );

        container.addChild( new AlignBox( new HBox( {
          spacing: 40,
          wrap: true,
          justify: 'left',
          lineSpacing: 30,
          preferredWidth: options.layoutWidth,
          children: filteredHighlanderArrays.map( richSolutions => {
            return new HBox( {
              spacing: 5,
              children: [
                ...richSolutions.map( solution => new PatternNode( patternBoard, solutionToDisplayFeatureSet( solution.solution ), planarPatternMap, {
                  scale: solutionScale,
                } ) ),
              ]
            } );
          } )
        } ), { margin: 5 } ) );


        // filteredHighlanderArrays.forEach( richSolutions => {
        //   container.addChild( new AlignBox( new HBox( {
        //     spacing: 10,
        //     children: [
        //       ...richSolutions.map( solution => new PatternNode( patternBoard, solutionToDisplayFeatureSet( solution.solution ), planarPatternMap ) ),
        //
        //     ]
        //   } ), { margin: 5 } ) );
        // } );

        //
        // container.addChild( new AlignBox( new HBox( {
        //   spacing: 10,
        //   children: [
        //     ...matchingSingleHighlanderSolutions.map( solution => new PatternNode( patternBoard, solutionToDisplayFeatureSet( solution.solution ), planarPatternMap ) ),
        //
        //   ]
        // } ), { margin: 5 } ) );

        //
        // container.addChild( new AlignBox( new HBox( {
        //   spacing: 10,
        //   children: widerSolutions.map( solution => new PatternNode( patternBoard, FeatureSet.fromSolution( patternBoard, solution ), planarPatternMap ) )
        // } ), { margin: 5 } ) );
        //


      }
      else {
        // Solutions
        const solutions = PatternBoardSolver.getSolutions( patternBoard, rule.inputFeatureSet.getFeaturesArray() );
        const solutionFeatureSets = solutions.map( solution => FeatureSet.fromSolution( patternBoard, solution ) );

        const compatibleFeatureSets: FeatureSet[] = [];
        const incompatibleFeatureSets: FeatureSet[] = [];
        for ( const solutionFeatureSet of solutionFeatureSets ) {
          if ( rule.outputFeatureSet.isCompatibleWith( solutionFeatureSet ) ) {
            compatibleFeatureSets.push( solutionFeatureSet );
          }
          else {
            // TODO: these should only exist for highlander rules
            incompatibleFeatureSets.push( solutionFeatureSet );
          }
        }

        assertEnabled() && assert( incompatibleFeatureSets.length === 0 );

        addHeader( 'Valid Solutions' );

        container.addChild( new AlignBox( new HBox( {
          spacing: 5,
          wrap: true,
          justify: 'left',
          lineSpacing: 30,
          preferredWidth: options.layoutWidth,
          children: [
            ...compatibleFeatureSets.map( solutionFeatureSet => new PatternNode( patternBoard, solutionFeatureSet, planarPatternMap, {
              scale: solutionScale,
            } ) ),
          ]
        } ), { margin: 5 } ) );
      }
    }

    // Embeddings
    {
      const getEmbeddingNode = ( name: string, displayEmbedding: DisplayEmbedding, style: TPuzzleStyle ) => {
        return new VBox( {
          spacing: 10,
          children: [
            new Text( name, { font: '16px Arial', fill: '#ccc' } ),
            new EmbeddedPatternRuleNode( rule, displayEmbedding, {
              cursor: 'pointer',
              scale: 30, // TODO: this is the scale internally in PatternNode, move it out?
              style: style,
            } )
          ]
        } );
      };

      // TODO: light classic for "classic" capable
      // TODO: dark edge-color-sector for "normal"

      const embeddingNodes = DisplayTiling.enumeration.values.map( displayTiling => {
        const displayEmbedding = getBestDisplayEmbedding( rule.patternBoard, displayTiling );

        if ( displayEmbedding ) {
          return getEmbeddingNode( displayTiling.displayName, displayEmbedding, darkAllPuzzleStyle );
        }
        else {
          return null;
        }
      } ).filter( node => !!node ) as Node[];

      // Classic case
      {
        const squareDisplayEmbedding = getBestDisplayEmbedding( rule.patternBoard, DisplayTiling.SQUARE );
        if ( squareDisplayEmbedding ) {
          const allFeaturesEdgeLike = rule.inputFeatureSet.getFeaturesArray().every( feature => {
            return feature instanceof FaceFeature || feature instanceof BlackEdgeFeature || feature instanceof RedEdgeFeature;
          } );

          if ( allFeaturesEdgeLike ) {
            embeddingNodes.unshift( getEmbeddingNode( 'Classic Square', squareDisplayEmbedding, lightClassicPuzzleStyle ) );
          }
        }
      }

      addHeader( 'Example Embeddings' );
      container.addChild( new Node( {
        layoutOptions: {
          topMargin: 20,
        },
        children: [
          new HBox( {
            spacing: 30,
            align: 'top',
            wrap: true,
            justify: 'left',
            lineSpacing: 30,
            preferredWidth: options.layoutWidth,
            children: embeddingNodes,
          } )
        ]
      } ) );
    }

    options.children = [
      new Panel( container, {
        fill: '#333',
        stroke: null,
      } ),
    ];

    super( options );
  }
}