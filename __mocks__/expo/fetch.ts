// Jest mock for expo/fetch — the real module extends a native response class
// that can't initialize under jest. Tests configure this fetch fn per case.
export const fetch = jest.fn();
