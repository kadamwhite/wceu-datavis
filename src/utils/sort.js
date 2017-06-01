// These methods are inlined from D3.js

export function ascending(a, b) {
  // eslint-disable-next-line no-nested-ternary
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

export function descending(a, b) {
  // eslint-disable-next-line no-nested-ternary
  return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}
