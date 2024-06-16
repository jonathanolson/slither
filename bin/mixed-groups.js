import { browserEvaluate, disposeBrowser, getBrowser } from './puppeteer-tools.js';
import fs from 'fs';
import os from 'os';

os.setPriority(os.constants.priority.PRIORITY_LOW);

(async () => {
  const browser = await getBrowser();

  const evaluateHooks = async (evaluate) => {
    return browserEvaluate(browser, 'http://localhost/slither/dist/hooks.html', evaluate);
  };

  for (const mainName of [
    'general-edge',
    'general-color',
    'general-edge-color',
    'general-edge-sector',
    'general-all',
  ]) {
    const loadCollection = (suffix) => {
      const filename = `./data/collections/${mainName}${suffix}.json`;

      if (fs.existsSync(filename)) {
        return JSON.parse(fs.readFileSync(filename, 'utf8'));
      } else {
        return null;
      }
    };

    const mainCollection = loadCollection('');
    const highlanderCollection = loadCollection('-highlander');

    console.log(mainName);
    const mixedGroup = await evaluateHooks(
      `collectionsToSortedMixedGroup( ${JSON.stringify(mainCollection)}, ${JSON.stringify(highlanderCollection)} )`,
    );

    fs.writeFileSync(`./data/mixed-groups/${mainName}.json`, JSON.stringify(mixedGroup), 'utf8');
  }

  await disposeBrowser(browser);
})();
