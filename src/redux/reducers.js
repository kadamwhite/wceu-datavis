import { combineReducers } from 'redux';

import messages, * as fromMessages from './reducers/messages';

/*
 * Combine reducers to produce single reducer for state.
 * Each reducer handles a sub-tree of the state tree based
 * on its name.
 */
export default combineReducers({
  messages,
});

/** Export selectors that delegate to store-specific methods */
export const getMessages = state => fromMessages.getMessages(state.messages);
