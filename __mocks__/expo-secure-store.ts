const store: Record<string, string> = {};

export async function setItemAsync(key: string, value: string) {
  store[key] = value;
}

export async function getItemAsync(key: string) {
  return store[key] ?? null;
}

export async function deleteItemAsync(key: string) {
  delete store[key];
}

export function _reset() {
  Object.keys(store).forEach((k) => delete store[k]);
}
