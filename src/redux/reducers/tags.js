import { combineReducers } from 'redux';
import { RECEIVE_TAGS } from '../actions';

function byId(state = {}, action) {
  switch (action.type) {

  case RECEIVE_TAGS:
    return {
      ...action.payload.reduce((newState, tag) => ({
        ...newState,
        [tag.id]: tag,
      }), state),
    };

  default:
    return state;
  }
}

function order(state = [], action) {
  switch (action.type) {

  case RECEIVE_TAGS:
    return state.concat(action.payload.map(tag => tag.id));

  default:
    return state;
  }
}

export default combineReducers({
  byId,
  order,
});

export const getTag = (state, id) => state.byId[id];
