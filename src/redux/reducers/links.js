import { ascending } from 'd3';
import { RECEIVE_POSTS } from '../actions';
import { postId, termId } from '../../services/api';
import findWhere from '../../utils/find-where';

/**
 * Create an object with source and target properties, such that the source
 * property is always before the target property in alphabetical order
 *
 * (this simplifies cases where we don't know the order of source & target)
 *
 * @param {String} id1 Source ID
 * @param {String} id2 Target ID
 * @returns {Object} Object with the alphabetically-first ID as source, and
 * the other as Target
 */
function createLink(id1, id2) {
  const [source, target] = [id1, id2].sort();
  return {
    source,
    target,
  };
}

/**
 * Given an array of links, either return a new array including all existing
 * links plus the provided new link, or else return a new array with link
 * values updated to match the provided new linked IDs
 *
 * @param {Array} arr An array of {source, target, value} link objects
 * @param {Object} link An object with .source and .target ID strings
 * @returns {Array} A new array updated with the specified link
 */
function createOrIncrementLink(arr, link) {
  const existingLink = findWhere(arr, link);
  if (! existingLink) {
    return arr.concat({
      ...link,
      value: 1,
    });
  }

  const existingLinkIndex = arr.indexOf(existingLink);
  return arr
    .slice(0, existingLinkIndex)
    .concat({
      ...existingLink,
      value: existingLink.value + 1,
    })
    .concat(arr.slice(existingLinkIndex + 1));
}

function linksForPost({ id, tags = [], categories = [] }) {
  const pId = postId(id);
  const terms = tags.concat(categories);
  const links = [];
  for (let t1 = 0; t1 < terms.length; t1 += 1) {
    const tId = terms[t1];
    // Each taxonomy is linked to its associated post,
    links.push(createLink(postId(pId), termId(tId)));
    for (let t2 = t1 + 1; t2 < terms.length; t2 += 1) {
      const tId2 = terms[t2];
      if (tId2) {
        links.push(createLink(termId(tId), termId(tId2)));
      }
    }
  }
  return links;
}

function mergeLinks(allLinks, newLinks) {
  return newLinks.reduce((merged, link) => createOrIncrementLink(merged, link), allLinks);
}

export default function(state = [], action) {
  switch (action.type) {

  case RECEIVE_POSTS:
    return action.payload
      .reduce((newState, post) => mergeLinks(newState, linksForPost(post)), state)
      // Ascending alphabetical order sorted by source, then target
      .sort((a, b) => ascending(`${a.source}${a.target}`, `${b.source}${b.target}`));

  default:
    return state;
  }
}
