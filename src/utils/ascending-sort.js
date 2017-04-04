// Inlined from D3.js:
// Equivalent to `import { ascending } from 'd3'; export default ascending;`
export default function(a, b) {
  // eslint-disable-next-line no-nested-ternary
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}
