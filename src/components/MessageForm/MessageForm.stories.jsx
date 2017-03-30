import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import MessageForm from './MessageForm';

storiesOf('MessageForm', module)
  .add('Submits Messages', () => (
    <MessageForm onSubmit={action('submitted message')} />
  ));
