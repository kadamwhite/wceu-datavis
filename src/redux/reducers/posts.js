import { combineReducers } from 'redux';
import { RECEIVE_POSTS } from '../actions';

function byId(state = {}, action) {
  switch (action.type) {

  case RECEIVE_POSTS:
    return {
      ...action.payload.reduce((newState, post) => ({
        ...newState,
        [post.id]: post,
      }), state),
    };

  default:
    return state;
  }
}

function order(state = [], action) {
  switch (action.type) {

  case RECEIVE_POSTS:
    return state.concat(action.payload.map(post => post.id));

  default:
    return state;
  }
}

export default combineReducers({
  byId,
  order,
});

export const getPost = (state, id) => state.byId[id];
