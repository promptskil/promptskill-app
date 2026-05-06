const store: Record<string, string> = {};

export default {
  setItem: jest.fn(async (key: string, value: string) => {
    store[key] = value;
  }),
  getItem: jest.fn(async (key: string) => {
    return store[key] ?? null;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete store[key];
  }),
  _reset() {
    Object.keys(store).forEach((k) => delete store[k]);
    this.setItem.mockClear();
    this.getItem.mockClear();
    this.removeItem.mockClear();
  },
};
