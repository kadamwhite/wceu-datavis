// Support all ES6 functionality, particularly the generators used by sagas
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

// AppContainer is a necessary wrapper component for HMR
import { AppContainer } from 'react-hot-loader';

// Provider makes the store available to connected components
import { Provider } from 'react-redux';

import makeStore from './redux/store';

import PostingFrequencyContainer from './components/PostingFrequencyContainer';

import api from './services/api';
import { receivePosts } from './redux/actions';

const store = makeStore();

// Kick off API requests
api.namespace('wceu/2017').posts()
  .then(posts => store.dispatch(receivePosts(posts)))
  .catch(e => console.error(e));

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <Component />
      </Provider>
    </AppContainer>,
    document.getElementById('wceu_datavis_application_root')
  );
};

render(PostingFrequencyContainer);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./components/PostingFrequencyContainer', () => {
    render(PostingFrequencyContainer);
  });
}
