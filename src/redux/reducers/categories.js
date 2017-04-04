import { combineReducers } from 'redux';
import { RECEIVE_CATEGORIES } from '../actions';

function byId(state = {}, action) {
  switch (action.type) {

  case RECEIVE_CATEGORIES:
    return {
      ...action.payload.reduce((newState, category) => ({
        ...newState,
        [category.id]: category,
      }), state),
    };

  default:
    return state;
  }
}

function order(state = [], action) {
  switch (action.type) {

  case RECEIVE_CATEGORIES:
    return state.concat(action.payload.map(category => category.id));

  default:
    return state;
  }
}

export default combineReducers({
  byId,
  order,
});

export const getCategory = (state, id) => state.byId[id];
