import CanSolveDifficulty from './CanSolveDifficulty.ts';

import { LocalStorageEnumerationProperty } from '../../util/localStorage.ts';

export const canSolveDifficultyProperty = new LocalStorageEnumerationProperty(
  'canSolveDifficulty',
  CanSolveDifficulty.EASY,
);
