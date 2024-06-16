import { Display, Node } from 'phet-lib/scenery';

import { PatternRule } from '../model/pattern/pattern-rule/PatternRule.ts';

import { PatternRuleAnalysisNode } from '../view/pattern/PatternRuleAnalysisNode.ts';

// @ts-expect-error
window.assertions.enableAssert();

// @ts-expect-error
const queryParameters = QueryStringMachine.getAll({
  r: {
    type: 'string',
    defaultValue: 'square-1-0/AQcODxARIib/ExkbIRwe/w==',
  },
});

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
  const rule: PatternRule = PatternRule.fromBinaryIdentifier(queryParameters.r);
  console.log(rule.serialize());

  scene.addChild(
    new PatternRuleAnalysisNode(rule, {
      left: 10,
      top: 10,
    }),
  );

  if (scene.bounds.isValid()) {
    display.setWidthHeight(Math.ceil(scene.right + 10), Math.ceil(scene.bottom + 10));
    display.updateDisplay();

    // Serialize it to XHTML that can be used in foreignObject (HTML can't be)

    const xhtml = new window.XMLSerializer().serializeToString(display.getRootBackbone().blocks[0].domElement);

    console.log(xhtml);
  }
})();
