import { RECEIVE_POSTS, RECEIVE_CATEGORIES, RECEIVE_TAGS } from '../actions';
import { normalizeResource } from '../../services/api';

const normalizeToDictionaryById = arr => arr
  .map(normalizeResource)
  .reduce((byId, node) => ({
    ...byId,
    [node.id]: {
      id: node.id,
      link: node.link,
      title: node.title,
      type: node.type,
      count: node.count,
    },
  }), {});

export default function(state = {}, action) {
  switch (action.type) {

  case RECEIVE_POSTS:
  case RECEIVE_CATEGORIES:
  case RECEIVE_TAGS:
    return {
      ...state,
      ...normalizeToDictionaryById(action.payload),
    };

  default:
    return state;
  }
}
