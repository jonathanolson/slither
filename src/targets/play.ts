import '../main.css';

import { DynamicProperty, Multilink, Property, TReadOnlyProperty, TinyEmitter, TinyProperty } from 'phet-lib/axon';
import { Bounds2 } from 'phet-lib/dot';
import { platform } from 'phet-lib/phet-core';
import { AlignBox, Display, HBox, ManualConstraint, Node, VBox, globalKeyStateTracker } from 'phet-lib/scenery';

import SlitherQueryParameters from '../SlitherQueryParameters.ts';

import { TStructure } from '../model/board/core/TStructure.ts';
import { showLayoutTestProperty } from '../model/board/layout/layout.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import EditMode, { eraserEnabledProperty, tryToSetEditMode } from '../model/puzzle/EditMode.ts';
import HintState from '../model/puzzle/HintState.ts';
import PuzzleModel from '../model/puzzle/PuzzleModel.ts';
import { TPropertyPuzzle } from '../model/puzzle/TPuzzle.ts';
import { getStartupPuzzleModel } from '../model/puzzle/getStartupPuzzleModel.ts';
import { getSolvablePropertyPuzzle } from '../model/solver/SATSolver.ts';

import { workaroundResolveStep } from '../util/sleep.ts';

import ControlBarNode from '../view/ControlBarNode.ts';
import EditModeBarNode from '../view/EditModeBarNode.ts';
import { HintStateNode } from '../view/HintStateNode.ts';
import PuzzleContainerNode from '../view/PuzzleContainerNode.ts';
import { controlBarMargin, currentTheme } from '../view/Theme.ts';
import { ViewContext } from '../view/ViewContext.ts';
import ViewStyleBarNode from '../view/ViewStyleBarNode.ts';
import { glassPane } from '../view/glassPane.ts';
import { currentPuzzleStyle, showPuzzleStyleProperty } from '../view/puzzle/puzzleStyles.ts';
import { scene } from '../view/scene.ts';

// TODO: also see web worker cases where this is used
// TODO: factor out
// @ts-expect-error
if (window.assertions && !import.meta.env.PROD) {
  // TODO: We should actually... have stripped these, something is going wrong
  console.log('enabling assertions');
  // @ts-expect-error
  window.assertions.enableAssert();
}

const rootNode = new Node({
  renderer: 'svg',
  children: [scene],
});

// Isolated for ease of refactoring
// TODO: We could move this to a single outside export, so things can add debugging popups
export const getRootNode = () => rootNode;

const display = new Display(rootNode, {
  allowWebGL: true,
  allowBackingScaleAntialiasing: true,
  allowSceneOverflow: false,
  accessibility: true,
  backgroundColor: '#eee',

  assumeFullWindow: true,
  listenToOnlyElement: SlitherQueryParameters.debugColors,
});
document.body.appendChild(display.domElement);

display.setPointerAreaDisplayVisible(SlitherQueryParameters.showPointerAreas);

window.oncontextmenu = (e) => e.preventDefault();

export const layoutBoundsProperty = new Property(new Bounds2(0, 0, window.innerWidth, window.innerHeight));

// TODO: properly support null (it isn't right now)
const puzzleModelProperty = new TinyProperty<PuzzleModel | null>(getStartupPuzzleModel());

const puzzleContainerNode = new PuzzleContainerNode(puzzleModelProperty, currentPuzzleStyle, {
  layoutOptions: {
    stretch: true,
    grow: 1,
  },
});

const topologicalContainerNode = new PuzzleContainerNode(puzzleModelProperty, currentPuzzleStyle, {
  layoutOptions: {
    stretch: true,
    grow: 1,
  },
  topological: true,
  visibleProperty: showLayoutTestProperty,
});

const hintStateProperty = new DynamicProperty(puzzleModelProperty, {
  derive: (puzzleModel: PuzzleModel | null): TReadOnlyProperty<HintState> => {
    return puzzleModel ? puzzleModel.hintStateProperty : new TinyProperty(HintState.DEFAULT);
  },
}) as TReadOnlyProperty<HintState>; // Why, TS?

// TODO: better place to handle this type of logic...
Multilink.multilink([currentTheme.navbarBackgroundColorProperty], (color) => {
  display.backgroundColor = color;
});

const stepEmitter = new TinyEmitter<[number]>();
const viewContext = new ViewContext(layoutBoundsProperty, glassPane, stepEmitter);

const controlBarNode = new ControlBarNode(puzzleModelProperty, viewContext, {
  // Require the complete data for now
  loadPuzzle: (puzzle: TPropertyPuzzle<TStructure, TCompleteData>): void => {
    const solvablePropertyPuzzle = getSolvablePropertyPuzzle(puzzle.board, puzzle.stateProperty.value);
    if (solvablePropertyPuzzle) {
      puzzleModelProperty.value = new PuzzleModel(solvablePropertyPuzzle);
    }
  },
});

const editModeBarNode = new EditModeBarNode(viewContext);

const viewStyleBarNode = new ViewStyleBarNode(viewContext);

const hintStatusNode = new HintStateNode(
  viewContext,
  hintStateProperty,
  () => {
    puzzleModelProperty.value?.onUserApplyHint();
  },
  () => {
    puzzleModelProperty.value?.onUserClearHint();
  },
);

const mainBox = new VBox({
  stretch: true,
  children: [
    new AlignBox(controlBarNode, {
      margin: controlBarMargin,
    }),
    new HBox({
      grow: 1,
      stretch: true,
      layoutOptions: {
        grow: 1,
      },
      children: [puzzleContainerNode, topologicalContainerNode],
    }),
    new AlignBox(viewStyleBarNode, {
      margin: controlBarMargin,
      visibleProperty: showPuzzleStyleProperty,
    }),
    new AlignBox(editModeBarNode, {
      margin: controlBarMargin,
    }),
  ],
});
layoutBoundsProperty.lazyLink((bounds) => {
  mainBox.preferredWidth = bounds.width;
  mainBox.preferredHeight = bounds.height;
  mainBox.x = bounds.left;
  mainBox.y = bounds.top;
});
scene.addChild(mainBox);
scene.addChild(hintStatusNode);
scene.addChild(glassPane);

ManualConstraint.create(scene, [controlBarNode, hintStatusNode], (controlBarProxy, hintTipProxy) => {
  hintTipProxy.centerTop = controlBarProxy.centerBottom.plusXY(0, 5);
});

display.initializeEvents();

let resizePending = true;
const resize = () => {
  resizePending = false;

  const layoutBounds = new Bounds2(0, 0, window.innerWidth, window.innerHeight);
  display.setWidthHeight(layoutBounds.width, layoutBounds.height);
  layoutBoundsProperty.value = layoutBounds;

  if (platform.mobileSafari) {
    window.scrollTo(0, 0);
  }
};

const resizeListener = () => {
  resizePending = true;
};
$(window).resize(resizeListener);
window.addEventListener('resize', resizeListener);
window.addEventListener('orientationchange', resizeListener);
window.visualViewport && window.visualViewport.addEventListener('resize', resizeListener);
resize();

display.updateOnRequestAnimationFrame((dt) => {
  // Work around iOS Safari... just not really calling setTimeout. Fun times. Hook into the animation frame if it hasn't yet.
  workaroundResolveStep();

  if (resizePending) {
    resize();
  }

  mainBox.validateBounds();

  // TODO: use ViewContext step? or not.
  puzzleContainerNode.step(dt);
  topologicalContainerNode.step(dt);
  puzzleModelProperty.value?.step(dt);

  stepEmitter.emit(dt);
});

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey) {
    if (event.key === 'z') {
      if (event.shiftKey) {
        // meta-shift-z REDO
        puzzleModelProperty.value?.onUserRedo();
      } else {
        // meta-z UNDO
        puzzleModelProperty.value?.onUserUndo();
      }
    }
    if (event.key === 'y') {
      puzzleModelProperty.value?.onUserRedo();
    }
  } else if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(event.key)) {
    const index = Number.parseInt(event.key, 10) - 1;

    const enabledEditModes = EditMode.enumeration.values.filter((mode) => mode.isEnabledProperty.value);

    if (index < enabledEditModes.length) {
      tryToSetEditMode(enabledEditModes[index]);
    }
  } else if (event.key === 'Escape') {
    puzzleModelProperty.value?.onUserEscape();
  }
});

globalKeyStateTracker.keydownEmitter.addListener((keyboardEvent) => {
  if (keyboardEvent.key === 'e') {
    eraserEnabledProperty.value = true;
  }
});

globalKeyStateTracker.keyupEmitter.addListener((keyboardEvent) => {
  if (keyboardEvent.key === 'e') {
    eraserEnabledProperty.value = false;
  }
});

// Clean up old puzzle models
puzzleModelProperty.lazyLink((puzzleModel, oldPuzzleModel) => {
  if (oldPuzzleModel) {
    oldPuzzleModel.dispose();
  }
});
