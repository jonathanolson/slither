import { FeatureSet } from '../feature/FeatureSet.ts';
import { SolutionSet } from '../SolutionSet.ts';
import { PatternRule } from '../PatternRule.ts';
import { TPatternFace } from '../TPatternFace.ts';
import FaceValue from '../../data/face-value/FaceValue.ts';
import { FaceColorDualFeature } from '../feature/FaceColorDualFeature.ts';
import { TPatternEdge } from '../TPatternEdge.ts';
import { getIndeterminateEdges } from '../getIndeterminateEdges.ts';

export class SolutionFeatureSet {

  private outputFeatureSet: FeatureSet | null = null;
  private computedOutputFeatureSet = false;

  public constructor(
    public readonly solutionSet: SolutionSet,
    public readonly featureSet: FeatureSet,
    public readonly previousSet: SolutionFeatureSet | null,
    // rules that we will use to filter out redundancies, stored here so we can prune it during the search
    public readonly previousRules: PatternRule[],
    public readonly highlander: boolean
  ) {}

  public withFaceValue( face: TPatternFace, value: FaceValue ): SolutionFeatureSet | null {
    const solutionSet = this.solutionSet.withFaceValue( face, value );
    if ( solutionSet ) {
      const featureSet = this.featureSet.clone();
      featureSet.addFaceValue( face, value );

      return new SolutionFeatureSet(
        solutionSet,
        featureSet,
        this,
        this.previousRules.filter( rule => {
          const ruleFaceValue = rule.inputFeatureSet.getFaceValue( face );

          return ruleFaceValue === undefined || ruleFaceValue === value;
        } ),
        this.highlander
      );
    }
    else {
      return null;
    }
  }

  // Only filters out rules that will need MORE face values to match. Signals we are DONE adding face values
  public withCompletedFaceValues(): SolutionFeatureSet {
    const faces = this.featureSet.patternBoard.faces;

    return new SolutionFeatureSet(
      this.solutionSet,
      this.featureSet,
      this.previousSet, // NOTE: copying the previous set, because we didn't actually "change" our features
      this.previousRules.filter( rule => {
        for ( const face of faces ) {
          const ruleFaceValue = rule.inputFeatureSet.getFaceValue( face );
          if ( ruleFaceValue !== undefined && ruleFaceValue !== this.featureSet.getFaceValue( face ) ) {
            return false;
          }
        }
        return true;
      } ),
      this.highlander
    );
  }

  public withFaceColorDuals( features: FaceColorDualFeature[] ): SolutionFeatureSet | null {
    const solutionSet = this.solutionSet.withFaceColorDuals( features );
    if ( solutionSet ) {
      const featureSet = this.featureSet.clone();
      for ( const feature of features ) {
        featureSet.addFaceColorDual( feature );
      }

      return new SolutionFeatureSet(
        solutionSet,
        featureSet,
        this,
        // TODO IS THERE A WAY WE CAN improve the filtering of rules here?
        this.previousRules,
        this.highlander
      );
    }
    else {
      return null;
    }
  }

  public nonExitEdgePartitioned( edge: TPatternEdge ): { black: SolutionFeatureSet | null; red: SolutionFeatureSet | null } {
    const solutionSets = this.solutionSet.nonExitEdgePartitioned( edge );

    let blackSet: SolutionFeatureSet | null = null;
    let redSet: SolutionFeatureSet | null = null;

    const blackPreviousRules: PatternRule[] = [];
    const redPreviousRules: PatternRule[] = [];

    // TODO: ignore previous rules IF our output feature set is a superset of the previous rule output.
    for ( const rule of this.previousRules ) {
      if ( rule.inputFeatureSet.impliesBlackEdge( edge ) ) {
        blackPreviousRules.push( rule );
      }
      else if ( rule.inputFeatureSet.impliesRedEdge( edge ) ) {
        redPreviousRules.push( rule );
      }
      else {
        blackPreviousRules.push( rule );
        redPreviousRules.push( rule );
      }
    }

    if ( solutionSets.black ) {
      const blackFeatureSet = this.featureSet.clone();
      blackFeatureSet.addBlackEdge( edge );
      blackSet = new SolutionFeatureSet(
        solutionSets.black,
        blackFeatureSet,
        this,
        blackPreviousRules,
        this.highlander
      );
    }
    if ( solutionSets.red ) {
      const redFeatureSet = this.featureSet.clone();
      redFeatureSet.addRedEdge( edge );
      redSet = new SolutionFeatureSet(
        solutionSets.red,
        redFeatureSet,
        this,
        redPreviousRules,
        this.highlander
      );
    }

    return { black: blackSet, red: redSet };
  }

  public withExitEdgeRed( edge: TPatternEdge ): SolutionFeatureSet | null {
    const solutionSet = this.solutionSet.withExitEdgeRed( edge );
    if ( solutionSet ) {
      const featureSet = this.featureSet.clone();
      featureSet.addRedEdge( edge );

      return new SolutionFeatureSet(
        solutionSet,
        featureSet,
        this,
        this.previousRules,
        this.highlander
      );
    }
    else {
      return null;
    }
  }

  // lazy computation
  public getOutputFeatureSet(): FeatureSet | null {
    if ( !this.computedOutputFeatureSet ) {
      this.computedOutputFeatureSet = true;

      let inputFeatureSet = this.featureSet;

      let solutionSet = this.solutionSet;

      // TODO: We should probably BAIL from the subtree if we detect a bad highlander rule(!)
      if ( this.highlander ) {
        // TODO: don't require a feature array?
        const filteredSet = solutionSet.withFilteredHighlanderSolutions( getIndeterminateEdges( this.featureSet.patternBoard, inputFeatureSet.getFeaturesArray() ) );

        if ( filteredSet ) {
          solutionSet = filteredSet;
        }
        else {
          return null;
        }
      }

      this.outputFeatureSet = solutionSet.addToFeatureSet( inputFeatureSet.clone() );
    }

    return this.outputFeatureSet;
  }
}