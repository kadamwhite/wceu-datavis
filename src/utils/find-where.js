export default function(arr, props) {
  return arr.find(item => Object.keys(props).reduce((allMatch, key) => (
    allMatch && item[key] === props[key]
  ), true)) || false;
}
