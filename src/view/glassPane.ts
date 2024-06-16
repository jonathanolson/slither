import { Node } from 'phet-lib/scenery';


// Tossing a global Node here, so that if we use a global scene we can add debugging content to it without
// triggering the import of our main.ts.
export const glassPane = new Node();
