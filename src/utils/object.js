/**
 * Utility function to see if one or many properties differ between two
 * provided objects
 *
 * This is useful for checking for differences between e.g. props and nextProps
 * in a shouldComponentUpdate method
 *
 * @example
 *
 *     const obj1 = { val: true };
 *     const obj2 = { val: true };
 *
 *     valueChanged(obj1, obj2, 'val'); // false
 *
 *     const obj1 = { val1: true,  val2: 1 };
 *     const obj2 = { val1: false, val2: 1 };
 *
 *     valueChanged(obj1, obj2, [ 'val1', 'val2' ]); // true
 *
 * @returns {Boolean} Whether any of the specified properties differ between
 * the two provided objects (by strict equality comparison)
 */
export function valueChanged(obj1, obj2, props) {
  // Support a string or an array for the final property
  const propsArr = Array.isArray(props) ? props : [props];

  for (let i = 0; i < propsArr.length; i += 1) {
    if (obj1[propsArr[i]] !== obj2[propsArr[i]]) {
      return true;
    }
  }

  return false;
}

/**
 * omit one or many properties from an object
 *
 * @example
 *
 *     omit({ a: 1, b: 2, c: 3}, ['b', 'c'])  // {a: 1}
 *     omit({ a: 1, b: 2, c: 3}, 'a')         // {b: 2, c: 3}
 *
 * @param {Object} obj An object from which to omit props
 * @param {String|String[]} props A string property or array thereof
 * @returns {Object} A new object with only the specified properties
 */
export function omit(obj, props) {
  // Support a string or an array for the final property
  const propsArr = Array.isArray(props) ? props : [props];
  return Object.keys(obj).reduce((carry, prop) => {
    if (propsArr.includes(prop)) {
      return carry;
    }
    return Object.assign(carry, {
      [prop]: obj[prop],
    });
  }, {});
}

/**
 * Pick one or many properties from an object
 *
 * @example
 *
 *     pick({ a: 1, b: 2, c: 3}, ['b', 'c'])  // {b: 2, c: 3}
 *     pick({ a: 1, b: 2, c: 3}, 'a')         // {a: 1}
 *
 * @param {Object} obj An object from which to pick props
 * @param {String|String[]} props A string property or array thereof
 * @returns {Object} A new object with only the specified properties
 */
export function pick(obj, props) {
  // Support a string or an array for the final property
  const propsArr = Array.isArray(props) ? props : [props];
  return propsArr.reduce((carry, prop) => {
    if (! obj[prop]) {
      return carry;
    }
    return Object.assign({}, carry, {
      [prop]: obj[prop],
    });
  }, {});
}
