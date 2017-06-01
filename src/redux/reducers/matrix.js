import { RECEIVE_POSTS, RECEIVE_CATEGORIES, RECEIVE_TAGS } from '../actions';
import { postId, termId } from '../../services/api';
import { ascending } from '../../utils/sort';

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

  case RECEIVE_TAGS:
  case RECEIVE_CATEGORIES:
    /* eslint-disable no-shadow */// Everything refers to the same object
    return action.payload.reduce((newState, term) => {
      const tId = termId(term.id);
      // Associate the term itself with each post it contains,
      return term.posts.reduce((carry, pId) => set((
        // but first, associate the term with all of that posts other terms
        // (this becomes the first argument for the wrapping call to `set()`)
        Object.keys(carry[pId] || {}).reduce((carry, tId2) => set(carry, tId, tId2), carry)
      ), pId, tId), newState);
    }, state);
    /* eslint-enable no-shadow */

  case RECEIVE_POSTS:
    return action.payload.reduce((newState, post) => {
      const ids = [
        postId(post.id),
        ...(post.categories || []).concat(post.tags || []).map(termId),
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
