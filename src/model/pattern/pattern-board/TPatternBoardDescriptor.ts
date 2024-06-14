import assert, { assertEnabled } from '../../../workarounds/assert.ts';

export type TPatternBoardDescriptor = {
  numNonExitVertices: number;
  numExitVertices: number;
} & (
  | {
      type: 'faces';
      vertexLists: number[][];
    }
  | {
      type: 'edge'; // single edge with two "exit faces"
    }
  | {
      type: 'non-exit-vertex';
      edgeCount: number;
    }
  | {
      type: 'exit-vertex';
      edgeCount: number;
      spans: number[]; // consecutive sector counts
    }
);

export const patternBoardDescriptorEquals = (a: TPatternBoardDescriptor, b: TPatternBoardDescriptor): boolean => {
  // Mostly auto-generated, perhaps we can do _.equals (but we might have non-equivalent types)
  if (a.numNonExitVertices !== b.numNonExitVertices || a.numExitVertices !== b.numExitVertices || a.type !== b.type) {
    return false;
  }

  if (a.type === 'faces' && b.type === 'faces') {
    if (a.vertexLists.length !== b.vertexLists.length) {
      return false;
    }

    for (let i = 0; i < a.vertexLists.length; i++) {
      if (a.vertexLists[i].length !== b.vertexLists[i].length) {
        return false;
      }

      for (let j = 0; j < a.vertexLists[i].length; j++) {
        if (a.vertexLists[i][j] !== b.vertexLists[i][j]) {
          return false;
        }
      }
    }
  }
  if (a.type === 'non-exit-vertex' && b.type === 'non-exit-vertex') {
    if (a.edgeCount !== b.edgeCount) {
      return false;
    }
  }
  if (a.type === 'exit-vertex' && b.type === 'exit-vertex') {
    if (a.edgeCount !== b.edgeCount) {
      return false;
    }

    if (a.spans.length !== b.spans.length) {
      return false;
    }

    for (let i = 0; i < a.spans.length; i++) {
      if (a.spans[i] !== b.spans[i]) {
        return false;
      }
    }
  }

  return true;
};

export const serializePatternBoardDescriptor = (descriptor: TPatternBoardDescriptor): string => {
  const arr: any[] = [];

  arr.push(descriptor.numNonExitVertices);
  arr.push(descriptor.numExitVertices);
  arr.push(descriptor.type);
  if (descriptor.type === 'faces') {
    arr.push(descriptor.vertexLists);
  } else if (descriptor.type === 'non-exit-vertex' || descriptor.type === 'exit-vertex') {
    arr.push(descriptor.edgeCount);
    if (descriptor.type === 'exit-vertex') {
      arr.push(descriptor.spans);
    }
  }

  const result = JSON.stringify(arr);
  assertEnabled() && assert(patternBoardDescriptorEquals(deserializePatternBoardDescriptor(result), descriptor));

  return result;
};

export const deserializePatternBoardDescriptor = (str: string): TPatternBoardDescriptor => {
  const arr = JSON.parse(str);

  const numNonExitVertices = arr.shift();
  const numExitVertices = arr.shift();

  const type = arr.shift();

  if (type === 'faces') {
    return {
      numNonExitVertices,
      numExitVertices,
      type,
      vertexLists: arr.shift(),
    };
  } else if (type === 'non-exit-vertex') {
    return {
      numNonExitVertices,
      numExitVertices,
      type,
      edgeCount: arr.shift(),
    };
  } else if (type === 'exit-vertex') {
    return {
      numNonExitVertices,
      numExitVertices,
      type,
      edgeCount: arr.shift(),
      spans: arr.shift(),
    };
  } else {
    return {
      numNonExitVertices,
      numExitVertices,
      type,
    };
  }
};
