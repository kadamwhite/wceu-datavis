// Support all ES6 functionality, particularly the generators used by sagas
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

// AppContainer is a necessary wrapper component for HMR
import { AppContainer } from 'react-hot-loader';

// Provider makes the store available to connected components
import { Provider } from 'react-redux';

import makeStore from './redux/store';

import AdjacencyGraphContainer from './components/AdjacencyGraphContainer';

import api from './services/api';
import { receiveCategories, receiveTags } from './redux/actions';

const store = makeStore();

// Kick off API requests
// getAllPosts(batch => store.dispatch(receivePosts(batch)))
//   .catch(e => console.error(e));
api.namespace('wceu/2017').posts().byTag()
  .then(tags => store.dispatch(receiveTags(tags)))
  .catch(e => console.error(e));
api.namespace('wceu/2017').posts().byCategory()
  .then(categories => store.dispatch(receiveCategories(categories)))
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

render(AdjacencyGraphContainer);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./components/AdjacencyGraphContainer', () => {
    render(AdjacencyGraphContainer);
  });
}
