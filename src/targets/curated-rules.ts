import { AlignBox, Display, FireListener, Node, Rectangle, VBox } from 'phet-lib/scenery';

import { curatedRules } from '../model/pattern/data/curatedRules.ts';
import { planarPatternMaps } from '../model/pattern/pattern-board/planar-map/planarPatternMaps.ts';
import { PatternRule } from '../model/pattern/pattern-rule/PatternRule.ts';

import { copyToClipboard } from '../util/copyToClipboard.ts';

import { PatternRuleNode } from '../view/pattern/PatternRuleNode.ts';

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

  const rules: PatternRule[] = curatedRules;

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
