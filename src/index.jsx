// Support all ES6 functionality, particularly the generators used by sagas
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

// AppContainer is a necessary wrapper component for HMR
import { AppContainer } from 'react-hot-loader';

// Provider makes the store available to connected components
import { Provider } from 'react-redux';

import makeStore from './redux/store';

import './global.styl';

import App from './components/App';

import { getAllPosts, getAllCategories, getAllTags } from './services/api';
import { receivePosts, receiveCategories, receiveTags } from './redux/actions';

const store = makeStore();

// Kick off API requests
getAllPosts(batch => store.dispatch(receivePosts(batch)))
  .catch(e => console.error(e));
getAllCategories(batch => store.dispatch(receiveCategories(batch)))
  .catch(e => console.error(e));
getAllTags(batch => store.dispatch(receiveTags(batch)))
  .catch(e => console.error(e));

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <Component />
      </Provider>
    </AppContainer>,
    document.getElementById('tag_adjacency_application_root')
  );
};

render(App);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./components/App', () => {
    render(App);
  });
}
