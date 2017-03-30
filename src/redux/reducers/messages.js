import { SUBMIT_MESSAGE } from '../actions';

export default function(state = [], action) {
  switch (action.type) {

  case SUBMIT_MESSAGE:
    return state.concat(action.payload);

  default:
    return state;
  }
}

export const getMessages = state => state;
