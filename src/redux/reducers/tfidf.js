import { combineReducers } from 'redux';
import { RECEIVE_TFIDF } from '../actions';
import { postId } from '../../services/api';


function byId(state = {}, action) {
  switch (action.type) {

  case RECEIVE_TFIDF:
    return {
      ...action.payload.reduce((newState, post) => ({
        ...newState,
        [postId(post.id)]: {
          ...post,
          id: postId(post.id),
        },
      }), state),
    };

  default:
    return state;
  }
}

function order(state = [], action) {
  switch (action.type) {

  case RECEIVE_TFIDF:
    return state.concat(action.payload.map(post => postId(post.id)));

  default:
    return state;
  }
}

export default combineReducers({
  byId,
  order,
});

export const getPost = (state, id) => state.byId[id];
