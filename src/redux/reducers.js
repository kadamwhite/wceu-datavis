import { combineReducers } from 'redux';

import posts from './reducers/posts';
import tags from './reducers/tags';
import categories from './reducers/categories';
import nodes from './reducers/nodes';
import links from './reducers/links';
import matrix from './reducers/matrix';

import { ascending } from '../utils/sort';

/*
 * Combine reducers to produce single reducer for state. Each reducer handles
 * a sub-tree of the state tree based on its name.
 */
export default combineReducers({
  // State properties that hold the actual API resource responses
  posts,
  tags,
  categories,
  // State properties that hold our chart-specific data structure
  nodes,
  links,
  matrix,
});

/** Export selectors */
export const getNodes = state => state.nodes;

export const getLinks = state => state.links;

export const getResource = (state, resourceId) => {
  // If it's a term ID,
  if (resourceId[0] === 't') {
    const id = resourceId.substr(1);
    // look for it in categories, then tags (categories is usually a smaller
    // array, so we check it first)
    if (state.categories.byId[id]) {
      return state.categories.byId[id];
    }
    if (state.tags.byId[id]) {
      return state.tags.byId[id];
    }
    // Otherwise, we don't have a term for it
    return null;
  }

  // And if it's not a term ID, it's a post
  return state.posts.byId[resourceId] || null;
};

export const getCoincidenceCount = (state, id1, id2) => {
  const [source, target] = [id1, id2].sort(ascending);
  return state.matrix[source] ? state.matrix[source][target] : 0;
};
