import { advancedSettingsVisibleProperty } from './SettingsNode.ts';
import { currentTheme, generateButtonFont, uiFont } from './Theme.ts';
import { UIAquaRadioButtonGroup } from './UIAquaRadioButtonGroup.ts';
import { UIText } from './UIText.ts';
import { UITextCheckbox } from './UITextCheckbox.ts';
import { UITextPushButton } from './UITextPushButton.ts';
import { ViewContext } from './ViewContext.ts';
import { getVerticalRadioButtonGroup } from './getVerticalRadioButtonGroup.ts';

import { BooleanProperty, Multilink, NumberProperty, Property, TinyEmitter, TinyProperty } from 'phet-lib/axon';
import { Dimension2 } from 'phet-lib/dot';
import { Shape } from 'phet-lib/kite';
import { optionize } from 'phet-lib/phet-core';
import { HBox, HBoxOptions, HSeparator, Node, Path, Rectangle, Text, VBox } from 'phet-lib/scenery';
import { NumberControl } from 'phet-lib/scenery-phet';

import { PolygonGenerator } from '../model/board/PolygonGenerator.ts';
import { PolygonGeneratorBoard } from '../model/board/core/PolygonGeneratorBoard.ts';
import { TStructure } from '../model/board/core/TStructure.ts';
import { getCentroid } from '../model/board/core/createBoardDescriptor.ts';
import { polygonGenerators } from '../model/board/generators/polygonGenerators.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import FaceValue from '../model/data/face-value/FaceValue.ts';
import CanSolveDifficulty, { canSolveDifficultyProperty } from '../model/generator/CanSolveDifficulty.ts';
import { generateAdditiveConstrained } from '../model/generator/generateAdditiveConstrained.ts';
import { BasicPuzzle } from '../model/puzzle/BasicPuzzle.ts';
import { TPropertyPuzzle } from '../model/puzzle/TPuzzle.ts';

import { LocalStorageProperty } from '../util/localStorage.ts';

type SelfOptions = {
  loadPuzzle: (puzzle: TPropertyPuzzle<TStructure, TCompleteData>) => void;
};

export type GenerateNodeOptions = SelfOptions & HBoxOptions;

// TODO: place it in such a way where we set preferred size?
export class GenerateNode extends HBox {
  public constructor(viewContext: ViewContext, providedOptions: GenerateNodeOptions) {
    // TODO: global rotation
    // TODO: await generation process, show it on the board (do a lookup on view step)
    // TODO: zoomable preview?

    // TODO: board storage / board JSON (custom) import --- ability to "name" a board

    // TODO: should we remember the user's last selection?
    const polygonGeneratorProperty = new LocalStorageProperty<PolygonGenerator>('polygonGeneratorProperty', {
      serialize: (generator) => generator.name,
      deserialize: (value) => polygonGenerators.find((generator) => generator.name === value) ?? polygonGenerators[0],
    });
    // TODO: simplify this a bit

    const initialParameters =
      localStorage.getItem('polygonGeneratorParameters') ?
        JSON.parse(localStorage.getItem('polygonGeneratorParameters')!)
      : null;
    let usedInitialParameters = false;

    const polygonGeneratorButtonGroup = getVerticalRadioButtonGroup(
      'Patterns',
      polygonGeneratorProperty,
      polygonGenerators.map((generator) => {
        return {
          value: generator,
          createNode: () =>
            new Text(generator.name, {
              font: uiFont,
              fill: currentTheme.uiForegroundColorProperty,
            }),
          labelContent: generator.name,
        };
      }),
      {
        layoutOptions: {
          align: 'top',
          grow: 0,
        },
        justify: 'top',
      },
    );

    const generateButtonContainer = new HBox({
      spacing: 10,
      align: 'center',
      layoutOptions: {
        grow: 0,
      },
      grow: 1,
    });

    const difficultyControlsContainer = new HBox({
      spacing: 10,
      align: 'center',
      layoutOptions: {
        grow: 0,
      },
      children: [
        new UIText('Difficulty'),
        new UIAquaRadioButtonGroup(
          canSolveDifficultyProperty,
          [
            {
              value: CanSolveDifficulty.EASY,
              createNode: () => new UIText('Easy'),
              labelContent: 'Easy',
            },
            {
              value: CanSolveDifficulty.MEDIUM,
              createNode: () => new UIText('Medium'),
              labelContent: 'Medium',
            },
            {
              value: CanSolveDifficulty.HARD,
              createNode: () => new UIText('Hard'),
              labelContent: 'Hard',
            },
            {
              value: CanSolveDifficulty.NO_LIMIT,
              createNode: () => new UIText('No Limit'),
              labelContent: 'No Limit',
            },
          ],
          {
            orientation: 'horizontal',
            align: 'center',
            spacing: 30,
          },
        ),
      ],
    });

    const propertiesControlsContainer = new HBox({
      spacing: 10,
      align: 'center',
      justify: 'spaceEvenly',
      layoutOptions: {
        grow: 0,
      },
    });

    const previewBoardNode = new Node();
    const previewGeneratedNode = new Node();

    const interruptGenerateEmitter = new TinyEmitter();

    interruptGenerateEmitter.addListener(() => {
      previewGeneratedNode.children = [];
    });

    const previewContainer = new Node({
      children: [previewBoardNode, previewGeneratedNode],
    });

    const setPreview = (generator: PolygonGenerator, parameters: Record<string, any>) => {
      // TODO: switch to a Property<Vector2[][]>, so we can remove them. We'll display them efficiently here
      const polygons = generator.generate(parameters);

      const shape = new Shape();
      polygons.forEach((polygon) => shape.polygon(polygon));
      previewBoardNode.children = [
        new Path(shape, {
          fill: currentTheme.puzzleBackgroundColorProperty,
          stroke: currentTheme.blackLineColorProperty,
          lineWidth: 0.05,
        }),
      ];
      interruptGenerateEmitter.emit();
    };

    setPreview(polygonGenerators[0], {
      width: 5,
      height: 5,
    });

    polygonGeneratorProperty.link((generator) => {
      propertiesControlsContainer.children.forEach((child) => child.dispose());
      generateButtonContainer.children.forEach((child) => child.dispose());

      const parameters: Record<string, any> = {};

      // TODO: simplify this a bit
      const getInitialParameterValue = (key: string) => {
        if (initialParameters && !usedInitialParameters && key in initialParameters) {
          return initialParameters[key]; // TODO: hopefully this is... in range?  eeek
        } else {
          return generator.defaultParameterValues[key];
        }
      };

      const update = () => {
        localStorage.setItem('polygonGeneratorParameters', JSON.stringify(parameters));
        setPreview(generator, parameters);
      };

      for (const [key, parameter] of Object.entries(generator.parameters)) {
        if (parameter.type === 'integer') {
          const property = new NumberProperty(getInitialParameterValue(key));
          property.link((value) => {
            parameters[key] = value;
            update();
          });
          propertiesControlsContainer.addChild(
            new NumberControl(parameter.label, property, parameter.range, {
              layoutFunction: NumberControl.createLayoutFunction4(),
              titleNodeOptions: {
                font: uiFont,
                fill: currentTheme.uiForegroundColorProperty,
              },
              sliderOptions: {
                trackSize: new Dimension2(100, 5),
                labelTagName: 'label',
                keyboardStep: 1,
                labelContent: parameter.label,
              },
              arrowButtonOptions: {
                touchAreaXDilation: 5,
                touchAreaYDilation: 25,
              },
              numberDisplayOptions: {
                decimalPlaces: 0,
              },
              delta: 1,
              visibleProperty: parameter.advanced ? advancedSettingsVisibleProperty : null,
            }),
          );
        } else if (parameter.type === 'float') {
          const property = new NumberProperty(getInitialParameterValue(key));
          property.link((value) => {
            parameters[key] = value;
            update();
          });
          propertiesControlsContainer.addChild(
            new NumberControl(parameter.label, property, parameter.range, {
              layoutFunction: NumberControl.createLayoutFunction4(),
              titleNodeOptions: {
                font: uiFont,
                fill: currentTheme.uiForegroundColorProperty,
              },
              sliderOptions: {
                trackSize: new Dimension2(100, 5),
                labelTagName: 'label',
                keyboardStep: 0.1,
                labelContent: parameter.label,
              },
              numberDisplayOptions: {
                decimalPlaces: 2,
              },
              delta: 0.01,
              visibleProperty: parameter.advanced ? advancedSettingsVisibleProperty : null,
            }),
          );
        } else if (parameter.type === 'boolean') {
          const property = new BooleanProperty(getInitialParameterValue(key));
          property.link((value) => {
            parameters[key] = value;
            update();
          });
          propertiesControlsContainer.addChild(
            new UITextCheckbox(parameter.label, property, {
              advanced: parameter.advanced,
            }),
          );
        } else if (parameter.type === 'choice') {
          const property = new Property<string>(getInitialParameterValue(key));
          property.link((value) => {
            parameters[key] = value;
            update();
          });

          // TODO: refactor getVerticalRadioButtonGroup to UIVerticalRadioButtonGroup? (and add advanced pass-through handling)
          propertiesControlsContainer.addChild(
            getVerticalRadioButtonGroup(
              parameter.label,
              property,
              parameter.choices.map((choice) => {
                return {
                  value: choice.value,
                  createNode: () =>
                    new Text(choice.label, {
                      font: uiFont,
                      fill: currentTheme.uiForegroundColorProperty,
                    }),
                  labelContent: choice.label,
                };
              }),
            ),
          );
        } else {
          // TODO::: more!!!
        }
      }

      usedInitialParameters = true;

      generateButtonContainer.addChild(
        new UITextPushButton('Generate', {
          font: generateButtonFont,
          layoutOptions: {
            align: 'center',
          },
          listener: async () => {
            interruptGenerateEmitter.emit();

            const polygons = generator.generate(parameters);

            const board = PolygonGeneratorBoard.get(generator, parameters);

            const interruptedProperty = new TinyProperty(false);

            const interruptListener = () => {
              interruptedProperty.value = true;
            };
            interruptGenerateEmitter.addListener(interruptListener);

            const faceDefineEmitter = new TinyEmitter<[index: number, state: FaceValue]>();
            const faceMinimizeEmitter = new TinyEmitter<[index: number, state: FaceValue]>();
            const faceResetEmitter = new TinyEmitter();

            faceResetEmitter.addListener(() => {
              previewGeneratedNode.children = [];
            });

            faceDefineEmitter.addListener((index, state) => {
              previewGeneratedNode.addChild(
                new Path(Shape.polygon(polygons[index]), {
                  fill: currentTheme.generateAddedFaceColorProperty,
                  stroke: currentTheme.blackLineColorProperty,
                  lineWidth: 0.05,
                }),
              );
              if (state !== null) {
                previewGeneratedNode.addChild(
                  new Text(`${state}`, {
                    font: generateButtonFont,
                    fill: currentTheme.faceValueColorProperty,
                    maxWidth: 0.9,
                    maxHeight: 0.9,
                    center: getCentroid(polygons[index]),
                  }),
                );
              }
            });

            faceMinimizeEmitter.addListener((index, state) => {
              previewGeneratedNode.addChild(
                new Path(Shape.polygon(polygons[index]), {
                  fill: currentTheme.generateMinimizedFaceColorProperty,
                  stroke: currentTheme.blackLineColorProperty,
                  lineWidth: 0.05,
                }),
              );
              if (state !== null) {
                previewGeneratedNode.addChild(
                  new Text(`${state}`, {
                    font: generateButtonFont,
                    fill: currentTheme.faceValueColorProperty,
                    maxWidth: 0.9,
                    maxHeight: 0.9,
                    center: getCentroid(polygons[index]),
                  }),
                );
              }
            });

            const minimizedPuzzle = await generateAdditiveConstrained(
              board,
              canSolveDifficultyProperty.value,
              interruptedProperty,
              faceDefineEmitter,
              faceMinimizeEmitter,
              faceResetEmitter,
            );

            if (minimizedPuzzle) {
              previewGeneratedNode.children = [];
              options.loadPuzzle(BasicPuzzle.fromSolvedPuzzle(minimizedPuzzle));
            }

            if (interruptGenerateEmitter.hasListener(interruptListener)) {
              interruptGenerateEmitter.removeListener(interruptListener);
            }
          },
        }),
      );
    });

    const previewRectangle = new Rectangle({
      fill: currentTheme.playAreaBackgroundColorProperty,
      sizable: true,
      layoutOptions: {
        grow: 1,
      },
      children: [previewContainer],
    });

    Multilink.multilink(
      [
        previewRectangle.localPreferredWidthProperty,
        previewRectangle.localPreferredHeightProperty,
        previewContainer.localBoundsProperty,
      ],
      (width, height, localBounds) => {
        if (width !== null && height !== null && localBounds.isFinite()) {
          const padding = 15;
          const availableWidth = width - 2 * padding;
          const availableHeight = height - 2 * padding;
          const scale = Math.min(availableWidth / localBounds.width, availableHeight / localBounds.height);
          if (scale > 0) {
            previewContainer.setScaleMagnitude(scale);
            previewContainer.centerX = width / 2;
            previewContainer.centerY = height / 2;
          }
        }
      },
    );

    const options = optionize<GenerateNodeOptions, SelfOptions, HBoxOptions>()(
      {
        spacing: 10,
        stretch: true,
        children: [
          polygonGeneratorButtonGroup,
          new VBox({
            spacing: 10,
            stretch: true,
            layoutOptions: {
              grow: 1,
            },
            children: [
              previewRectangle,
              generateButtonContainer,
              new HSeparator(),
              difficultyControlsContainer,
              new HSeparator(),
              propertiesControlsContainer,
            ],
          }),
        ],
      },
      providedOptions,
    );

    super(options);
  }
}
