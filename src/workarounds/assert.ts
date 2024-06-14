// @ts-expect-error
export default (predicate, ...messages) => window.assert(predicate, ...messages);

// @ts-expect-error
export const assertEnabled = (): boolean => !!window.assert;
