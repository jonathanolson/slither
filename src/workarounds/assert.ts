
// @ts-ignore
export default ( predicate, ...messages ) => window.assert( predicate, ...messages );

// @ts-ignore
export const assertEnabled = (): boolean => !!window.assert;
