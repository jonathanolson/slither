import layoutBase from '../../layout-base/index.js';
const LGraphManager = layoutBase.LGraphManager;

function CoSEGraphManager(layout) {
  LGraphManager.call(this, layout);
}

CoSEGraphManager.prototype = Object.create(LGraphManager.prototype);
for (var prop in LGraphManager) {
  CoSEGraphManager[prop] = LGraphManager[prop];
}

export default CoSEGraphManager;
