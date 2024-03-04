import { TReadOnlyProperty } from 'phet-lib/axon';
import PuzzleModel from '../../puzzle/PuzzleModel.ts';
import { Node } from 'phet-lib/scenery';
import { scene } from '../../../view/scene.ts';
import { TBoard } from '../core/TBoard.ts';
import { TState } from '../../data/core/TState.ts';
import { TFaceData } from '../../data/face/TFaceData.ts';
import { TEdgeData } from '../../data/edge/TEdgeData.ts';
import { TSimpleRegionData } from '../../data/simple-region/TSimpleRegionData.ts';
import { LayoutPuzzle } from './LayoutPuzzle.ts';
import { LayoutDerivative } from './LayoutDerivative.ts';
import { showLayoutTestProperty } from './layout.ts';

export const layoutTest = ( puzzleModelProperty: TReadOnlyProperty<PuzzleModel | null> ) => {

  const layoutTestNode = new Node( {
    scale: 0.4
  } );
  scene.addChild( layoutTestNode );

  const showPuzzleLayout = ( board: TBoard, state: TState<TFaceData & TEdgeData & TSimpleRegionData> ) => {

    // Don't show once solved?
    if ( state.getSimpleRegions().some( sr => sr.isSolved ) ) {
      return;
    }

    const layoutPuzzle = new LayoutPuzzle( board, state );

    // ----- buggy-looking things but seems to lay out planar
    // We seem to... cause a buggy-looking 1 case in the lower left (perfect... overlap?)
    // eJytWU1v20YQ/S8874GzHyTXtzpxL80pORY+qDWdCnCtwBKcBob+e2cka+lZP4aaQDBgyHqPw/l8++GX5nl82q43j80Vueavzerprrl6aXY/vo3NVXO92o7Xh++c8Hbrv8dtc/XnS/Nfc9W65sfh9/Pxj2f5a+/eYHTECGFeYaSwoGxqLB4xj2wmhennuiMW0HO9wvRzwxGL6LmsMP0cvSYmwcSQAqsndWq8BnVuKlAnpwKTirICOxVKBfbK2woclLdBg1l5q0HfKm8rkJS3FeiVtxUYlLcVGJW3UYNJeVuBnfK2AnUHVaBuoQrMylsNhlZ5mzRIytsK9MrbCgzK2wqMytsKTMrbCuyUt50Ge+VtBQ7K2wrMylsNxlZ5W4F6yipQT1mvQT1lFainrAL1lFWgnrIK1FNWgXrKBg3qKdNg0lNWgXrKKlBPWQXqKRv2t665X8HVYVo2WkfOu3D7aokAhVx0yfkTxQNKdJ3rXTpRAqB0bnDZ9SdKBJTBsUKzDucTKQFSYHdZjqm43AGSZ4dZeak43QNSYpdJeCfSAEg9O81KTCW2DEhZvGZJpq7kEeWaFwrxnMMsERJMuBfnWYtpKDyUdYmQC8MFbAsPpV6C7BwrtKfCQ/mXOHvHYu1L3giVgJcQDoJ125esEKqCkFrHKu1LigkVQkgcBL96yh+qhZA4CLZa2ohQOYTEQWSmlqZF9eDFhYNgRQ8lLx7VQyLtHOt3KHn2qB4Sae9YysM0LKgeEungWNVDaWKP6iGRZscCH0r+PBwJOgTBLpa8eFQPIXEQ/OqSZ4/qISQOgl895Q/VQ0jRsd6H0s8e1UMiTY6lP5b8BVQPXpA4CF4FYslLQPWQSAfHmh9LngOqh0SaHct/LPkLqB5Cah2vBHFSMFQPIXEQPVMLD9WDlyoJgl0seQmoHkJiaWWrJc8B1UMiTY4XhjTlD9VDIu0crxGp9HNA9ZBIWa0DU2/3zGy2u9VufHPE+LD599vDuBs/rnar5riIHD5OjN9PX71dYuSTcKZFYrJ92PO9IcQlQqoJviLkmkAV4aTBP2HQImMxEL/4lpMGzIfiF7Ph36XjHaNb8iO886O2EZZtvMu6P3TQePe1bpGb01dH9Ngi8kk4/PDT7tXmlMDx8U59R/vpPc31p98+/NGIP/NGCBjxViMeGAlvjXy++bhgAgUTLhFMtPkRgYl0iXyYjSBPOquRDhjprUbSkpHltCI/BpuJAZjI1lD6SxhBnlBrblY4v+YBzotWllOL+pW8zQZBI+YRDhexgjqWjEqAA4qX6DhKRleQFpBZUWCrdEZXYGqtRpBQk1mXCKkKGZUJl9moTQQlIRuNwN63GkGt4tsLhGM2gjrFm/XNI5m0m4G94o0a5+FuySqUSBG8fa8Da2TUOA+7xapOSFesRnCZzfsdHJBRnnCZjboCPQnGGQpwW2yfITSKwbhJwL6YzwrYjLFCAU1zMC8gARX6F8zA849xCcEhXcJItNcISVQ0nugiKnQ0T3REvfsLZuDZ0FzqCBNslIaI+iUaSw09Sca1KKGsJHO/RNQvyb5rh+dmZOZwBbeWK7fP49f15rG6SPlSQ5p9vFhZ38nanVKmnkLOXehzds0/q4f7m3L5YmnH89uFF4Fb16y3XzYPzyNj96uH7SgGxKUh56FLlPs+95Tlf1uLLs22tq1WsCRoT3pokPMLSD8LN4Z0/IltH1u5HF4K18OdXDvj0vz28eyV/3DQOv8sFOfY8BA3l8r54/TZR4c5MuLOpW/ujtFylWi5ITv3MD+X5LlLM8vdmOXe6Nxj9jDDnb1Kst0Y2Q7ZplPJ/OimSKydvY/D0KZ0jlLhjdJcuPObX9te7uwdTpjrlNltFUgOf/V9XD/dnfJwu9/v/wcZUOO+
    // Similar to above, but buggy 1 near the lower-middle-right
    // eJy1WE1z2zYQ/S8840DsAgTgW524l/aUHDs+qDWdaMa1MpbGbcaj/95dKQS962UotOnFI+s9Lt/bL8B+6Z7Hp/1299hdedf9vts83XVXL93h65exu+quN/vx+vSdY95h+8e4765+e+n+7q561309/Xw+//LMvx3dK8yfMW9hIDAvMBQxJRbOGFgxo8Dkc8MZQ+u5JDD5XD5jwXquCEw+578lJpqJ8QJUT8rUgARlbhQok6PAKFwqcBBWFJiEWgVmoRYlWIRaCUIv1CrQC7UKBKFWgSjUKjAItUGCUahV4CDUKlB2kAJlCymwCLUSxF6ojRL0Qq0CQahVIAq1CgxCrQKjUKvAQagdJJiEWgVmoVaBRaiVYOiFWgXKKVOgnLIkQTllCpRTpkA5ZQqUU6ZAOWUKlFOWJSinTIJRTpkC5ZQpUE6ZAuWU5eOt6+435ukwHxu98w4c3n6L5A2Kd8FFBxMFDEpwg0suThQ0KIPLrrg0UYJByY42NO3hMpGiQUKSS+vYV8mDQQISTJvXV9HJIEWS7Jk3kbJBSiSaNrGv3opBKqyaVrIfah6tXNNBwcrJZnXozYQDi6dd7HPlWVlnh1QYKmBfeVbq2eTgaEODrzwr/+wzOVrWUPPmrRLQEUImaG9DzYq3qsCk3tGWhppibxWCSWSCXj3nz6oFk8gERa1t5K1yMIlMFKLWprXqQYcLmaCNjjUvYNWDnQ6O9jfWPINVD3aaHK1ynIfFqgc7zY62OtYmBqse7LQ4WvBY8wfmSPiTCZJY8wJWPZhEJujVNc9g1YNJZIJePefPqgeTgqN9j7WfwaoHO42OVn+o+UOrHnQgkQk6BULNC1r1YKfZ0c4PNc9o1YOdFkfrP9T8oVUPJvWOToIwbzCrHkwiE4molWfVg44qNkESa17QqgeTaLVS1JpntOrBTqOjgyHO+bPqwU4HR2dErP2MVj3YKW1rJOrtkZjd/rA5jK/+xHi3+/PLw3gY328Om+58iJw+zoyfp69eHzH8iTnzUTPHPt1QXxFAE7wilLUI0+pcDjEtw5mBmhFXYwyrjKQZvfa6qmMa/+8w8poOWM0YvsmYfgu+8aLfgoYObqHx7pPukZvpqzN67hH+xBx6+OnwplnGxzvxnT/O7+muf/3p3S8d61kO4o0g8DrIh5v3KyHACIFtISwr+COshNYglpnYGmQwgqS2jMT/HiJb/dE3Z9Vss+Y+s/LqoTUKWlHaG8VKLrRbsjIjw1wwPOYANifG1jL8CC2NXQdW8zcHsdoFcmOQtBrkotRaTQelOYw1jjLMv7SEzQNgasHmXYlWZmSYCywVK0jzyqXX/m9hQt9mCa39EhoXQ7AmOjQvqWCeiqk5jGUpvrV0uhxv+TL8Yfy03T2qG85HDUn2+cazvWP33hePoccSckh0y/q8ebi/qbeiC5vxtHfadkPbvLS14sXNctoLF08LbSj+19V2/3H38DwSdr952I8cgFOZMMccQu5j7hFjXE/lcus1ddiyJKouhgJlyAgp9BdUd/nIbjpUlyUhScp9KthDAOD/na5JWrxeNd2ivqcoDj0MBfoAPeAFdfPmPl7qO4O7pH7pL42GW/iyz2GAUBKNew4Igf8/tebT7IWlVli4dxp66Ku/xu3T3fTq2+Px+A/aGe6A
    // Middle top, similar (collapses a fully empty path):
    // eJytWE1z20YM/S8874GL/SCpW504l/SUHDs6qBWdaMa1MpbGbcaj/15ACpcG/BR5G10yMt8j9PCwAFZ5bp7Gx91m+9AsvGv+3K4e183iudl//zY2i+ZmtRtvjs+c8Pabv8Zds/jjufm3WbSu+X789+n0x5P8dXAvMH/CPMJIYV5hQcXUWDxhhGImhen38gkL6L1OYfq9/oRF9N6gMP2e/2FMgsZ4BZo3tTWkQe2NAbU5BkwqSwNmlYoBO6XWgL1SGzQ4KLUapFapNaBXag1ISq0Bg1JrwKjURg0mpdaAWak1oD5BBtRHyICDUqvB0Cq1SYNeqTUgKbUGDEqtAaNSa8Ck1BowK7VZg51Sa8BeqTXgoNRqMLZKrQF1lxlQd1mnQd1lBtRdZkDdZQbUXWZA3WUG1F3Wa1B3mQaT7jID6i4zoO4yA+ou6w9L19yt4HaY10brvCMXlj8ieUDxLrrkaKIQoESXXefSRAmAkl3vBtdNlAgoveMJzXN4mEgJkALL5XHsi+QMSMSCefL6IroDpMSSvfAmUg9IHYvmSexLbgMgDaKaR7LPxUfkNS8KUc5plgw9NJxEPM9i3xcecl0y5MJwAdvCQ9ZLktnxhCZfeMh/ybNzPKyp+OZRCXiFcBI8t6m44lEVhNQ6ntJULPaoEELiJPirZ/9QLYTESXDUcow8KoeQOImBqeXQonrwcuEkeKKH4guhekim2fH8DsVnQvWQTDvHozzMzYLqIZn2jqd6KIeYUD0k08HxgA/FP4It4Y9JsMTiC6F6CImT4K8uPhOqh5A4Cf7q2T9UDyFFx/M+lPNMqB6SaXI8+mPxL6B68ELiJHgLxOJLQPWQTHvHMz8WnwOqh2Q6OB7/sfgXUD2E1DreBHGeYKgeQuIkOqYWHqoHrypJgiUWXwKqh5B4tHLU4nNA9ZBMk+PFkGb/UD0k0+x4R6RyngOqh2TK0zowdXlgZrPbr/bji58Y77Z/f7sf9+P71X7VnJbI8ePM+DA9erli5JNw5lUzxz5etl8QgiWQIWRL8IbQX4owXIowDd+ZESwjXWS8kmEZ9MoLq2MaJj9hvNJh/aSL2YZXOqxh4aKOqS1+EgPokCM2rr/YM3Q7PTqhpzMkn4TDLz/uXx2m8WGtnvnD/D3Np9v3jag5H8KDEFQXgkCIUBcCJVIZAiUSfz2R9OshfKWfHgaptCNcIUZCMSo9xcmoIDe///bu46UwEYWpLA7W0ldr6VGYoToMLNFQmRLyhdqrpKTDvOHsoy4mfx0tta0MfUnVWoarhMHO5GuklKu1oDChstQBDuzK1UNovtQGwUoqJy4OUlkf5oMgXWUQtMaqg0Al1XMOholUGyaiqRtDtZruYpjLzmAtlbMFB+krg6ApF6uXSERL5H+EQWoSWiPH30Yb+S30afyy2T6YC+xnC2n26UK7Wcv/6WWfcop5SJFy4ivy19X93W259ILbCGrSo+11/kI2mvPHw/V20+kcG96P8xn22d5dumaz+7y9fxoZu1vd70YJIFaGLrZtnynRkCh1/rKVhL7kuGLrdumbp7o/ZzxcsP5cUfHN65zx56+edTepqrsOKBM/+mfcPK6niiwPh8N/QpIPQg==

    // ------ has issues with planarity
    // Interesting constrained case, wants to "wrap around" the other direction
    // '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'

    layoutPuzzle.simplify();
    // layoutPuzzle.layout();

    // const barycentricDerivative = LayoutDerivative.getBarycentricDeltas( layoutPuzzle ).getAreaCorrectedDerivative();
    // const angularDerivative = LayoutDerivative.getAngularDeltas( layoutPuzzle ).getAreaCorrectedDerivative();
    // const angularDerivative = LayoutDerivative.getAngularDeltas( layoutPuzzle );

    // TODO: show multiple generations worth?

    // for ( let i = 0; i < 0; i++ ) {
    //   layoutPuzzle.applyDerivative( LayoutDerivative.getBarycentricDeltas( layoutPuzzle ).getAreaCorrectedDerivative().timesScalar( 0.1 ) );
    // }



    const getDerivative = () => {
      // return LayoutDerivative.getAngularDeltas( layoutPuzzle, 1 )
      //   .plus( LayoutDerivative.getHookesAttraction( layoutPuzzle, 1, 0.25 ) )
      //   .plus( LayoutDerivative.getRegularPolygonDeltas( layoutPuzzle, 1, true, 0.5 ) );
      //   // .getAreaCorrectedDerivative();
      return LayoutDerivative.getAngularDeltas( layoutPuzzle, 0.2 )
        .plus( LayoutDerivative.getHookesAttraction( layoutPuzzle, 1, 0.1 ) )
        .plus( LayoutDerivative.getRegularPolygonDeltas( layoutPuzzle, 1, true, 0.2 ) );
        // .getAreaCorrectedDerivative();
    };

    let amount = 0.3;
    for ( let i = 0; i < 40; i++ ) {
      if ( i % 10 === 0 ) {
        amount *= 0.95;
      }

      let derivative = getDerivative();
      {
        let maxMagnitude = derivative.getMaxMagnitude();

        let currentAmount = amount;
        if ( amount * maxMagnitude > 1.5 ) {
          currentAmount = 1.5 / maxMagnitude;
        }

        derivative = derivative.timesScalar( currentAmount );
      }

      // console.log( i, amount, derivative.getMaxMagnitude() );
      layoutPuzzle.applyDerivative( derivative );

      if ( derivative.getMaxMagnitude() < 0.015 ) {
        break;
      }

      // layoutPuzzle.applyDerivative( LayoutDerivative.getAngularDeltas( layoutPuzzle ).getAreaCorrectedDerivative().timesScalar( 0.1 ) );
    }

    // const angularDerivative = LayoutDerivative.getAngularDeltas( layoutPuzzle ).getAreaCorrectedDerivative();
    // const hookesDerivative = LayoutDerivative.getHookesAttraction( layoutPuzzle, 1, 0.2 ).getAreaCorrectedDerivative();

    const debugNode = new Node( {
      children: [
        layoutPuzzle.getDebugNode(),
        // getDerivative().getDebugNode(),
        // angularDerivative.getDebugNode(),
        // barycentricDerivative.getDebugNode(),
      ]
    } );

    const size = 600;

    debugNode.scale( Math.min( size / debugNode.width, size / debugNode.height ) );

    debugNode.left = 20;
    debugNode.top = 130;

    layoutTestNode.children = [
      debugNode
    ];
  };

  const puzzleStateListener = () => {
    layoutTestNode.children = [];

    if ( showLayoutTestProperty.value && puzzleModelProperty.value ) {
      showPuzzleLayout( puzzleModelProperty.value.puzzle.board, puzzleModelProperty.value.puzzle.stateProperty.value );
    }
  };
  puzzleModelProperty.lazyLink( puzzleStateListener );
  showLayoutTestProperty.lazyLink( puzzleStateListener );
  puzzleStateListener();

  puzzleModelProperty.link( ( newPuzzleModel, oldPuzzleModel ) => {
    if ( oldPuzzleModel ) {
      oldPuzzleModel.puzzle.stateProperty.unlink( puzzleStateListener );
    }
    if ( newPuzzleModel ) {
      newPuzzleModel.puzzle.stateProperty.link( puzzleStateListener );
    }
  } );
};