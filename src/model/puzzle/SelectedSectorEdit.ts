import SectorState from '../data/sector-state/SectorState.ts';
import { TSector } from '../data/sector-state/TSector.ts';

export type SelectedSectorEdit = {
  sector: TSector;
  currentState: SectorState;
};
