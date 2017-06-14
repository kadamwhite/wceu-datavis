// Support all ES6 functionality, particularly the generators used by sagas
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

// AppContainer is a necessary wrapper component for HMR
import { AppContainer } from 'react-hot-loader';

import TermFrequencyContainer from './components/TermFrequencyContainer';

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('wceu_datavis_application_root')
  );
};

render(TermFrequencyContainer);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./components/TermFrequencyContainer', () => {
    render(TermFrequencyContainer);
  });
}
