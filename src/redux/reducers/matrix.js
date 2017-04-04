import { RECEIVE_POSTS } from '../actions';
import { postId, termId } from '../../services/api';
import ascending from '../../utils/ascending-sort';

/** Increment a numeric value if one is provided, or else return 1 */
function incrementOrSet(val) {
  return val ? val + 1 : 1;
}

function set(state, id1, id2) {
  const [source, target] = [id1, id2].sort(ascending);

  // Add a level if we have not encountered this source before
  if (! state[source]) {
    return set({
      ...state,
      [source]: {},
    }, source, target);
  }

  // Initialize or increment the value in the nested object representing the
  // coincidence frequency of the two terms
  return {
    ...state,
    [source]: {
      ...state[source],
      [target]: incrementOrSet(state[source][target]),
    },
  };
}

export default function(state = {}, action) {
  switch (action.type) {

  case RECEIVE_POSTS:
    return action.payload.reduce((newState, post) => {
      const ids = [
        postId(post.id),
        ...post.categories.concat(post.tags).map(termId),
      ];

      while (ids.length) {
        const id1 = ids.shift();
        // eslint-disable-next-line no-param-reassign
        newState = ids.reduce((carry, id2) => (
          set(carry, id1, id2)
        ), newState);
      }

      return newState;
    }, state);

  default:
    return state;
  }
}
