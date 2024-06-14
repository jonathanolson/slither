import { AlignBox, Display, FireListener, Node, Rectangle, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { copyToClipboard } from './util/copyToClipboard.ts';
import { PatternRule } from './model/pattern/pattern-rule/PatternRule.ts';
import { planarPatternMaps } from './model/pattern/pattern-board/planar-map/planarPatternMaps.ts';
import { TPatternBoard } from './model/pattern/pattern-board/TPatternBoard.ts';
import { curatedRules } from './model/pattern/data/curatedRules.ts';
import { getEmbeddings } from './model/pattern/embedding/getEmbeddings.ts';

const DO_FILTER = true;

// @ts-expect-error
window.assertions.enableAssert();

const scene = new Node();

const rootNode = new Node({
  renderer: 'svg',
  children: [scene],
});

const display = new Display(rootNode, {
  allowWebGL: true,
  allowBackingScaleAntialiasing: true,
  allowSceneOverflow: false,
});
document.body.appendChild(display.domElement);

display.setWidthHeight(window.innerWidth, window.innerHeight);

console.log('test');

(async () => {
  const background = new Rectangle({
    fill: '#333',
  });
  scene.addChild(background);

  const container = new VBox({
    x: 10,
    y: 10,
    align: 'left',
  });
  scene.addChild(container);

  const addPaddedNode = (node: Node) => {
    container.addChild(new AlignBox(node, { margin: 5 }));
  };

  let rules: PatternRule[] = [];

  // rules.push( ...ruleSet.rules );
  // TODO: add back in rules

  const embeddedRuleMap = new Map<TPatternBoard, PatternRule[]>();

  const getEmbeddedRules = (patternBoard: TPatternBoard) => {
    if (!embeddedRuleMap.has(patternBoard)) {
      embeddedRuleMap.set(
        patternBoard,
        curatedRules.flatMap((curatedRule) =>
          curatedRule.getEmbeddedRules(getEmbeddings(curatedRule.patternBoard, patternBoard)),
        ),
      );
    }
    return embeddedRuleMap.get(patternBoard)!;
  };

  if (DO_FILTER) {
    rules = rules.filter((rule) => !rule.isRedundant(getEmbeddedRules(rule.patternBoard)));
  }

  addPaddedNode(
    new VBox({
      spacing: 20,
      children: rules.map((rule) => {
        const node = new PatternRuleNode(rule, planarPatternMaps.get(rule.patternBoard)!);

        node.cursor = 'pointer';

        node.addInputListener(
          new FireListener({
            fire: () => {
              copyToClipboard(JSON.stringify(rule.serialize()));
              console.log(JSON.stringify(rule.serialize()));
            },
          }),
        );

        return node;
      }),
    }),
  );

  display.setWidthHeight(Math.ceil(scene.right + 10), Math.ceil(scene.bottom + 10));

  display.initializeEvents();

  display.updateOnRequestAnimationFrame((dt) => {});
})();
