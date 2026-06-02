import "@testing-library/jest-dom/vitest";

// Node 26 ships a Web Storage API that exposes `localStorage` as `undefined`
// (requires --localstorage-file to be set). This undefined global shadows
// jsdom's own window.localStorage, breaking any test that calls
// `localStorage.clear()` etc.
//
// Fix: replace the Node 26 getter with a simple in-memory Storage shim
// so tests can use the bare `localStorage` identifier.
function makeLocalStorageShim(): Storage {
  const store: Record<string, string> = {};
  return {
    get length() { return Object.keys(store).length; },
    clear() { for (const k in store) delete store[k]; },
    getItem(k: string) { return k in store ? store[k] : null; },
    setItem(k: string, v: string) { store[k] = String(v); },
    removeItem(k: string) { delete store[k]; },
    key(n: number) { return Object.keys(store)[n] ?? null; },
  };
}

if (typeof localStorage === "undefined" || localStorage === null) {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    writable: true,
    value: makeLocalStorageShim(),
  });
}
