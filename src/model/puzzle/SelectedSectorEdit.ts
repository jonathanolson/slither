import { TSector } from '../data/sector-state/TSector.ts';
import SectorState from '../data/sector-state/SectorState.ts';

export type SelectedSectorEdit = {
  sector: TSector;
  currentState: SectorState;
};