import React from 'react';

import Logo from './Logo/Logo';
import Hello from './Hello/Hello';
import MessageFormContainer from './MessageFormContainer/MessageFormContainer';
import MessagesContainer from './MessagesContainer/MessagesContainer';

const App = () => (
  <div>
    <Logo text="Snaps!" />
    <Hello addressee="World" />
    <p>And some running body copy, <em>just in case</em>&trade;</p>
    <MessageFormContainer />
    <MessagesContainer />
  </div>
);

export default App;
