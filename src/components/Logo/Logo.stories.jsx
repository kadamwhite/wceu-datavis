import React from 'react';
import { storiesOf } from '@kadira/storybook';

import Logo from './Logo';

storiesOf('Logo', module)
  .add('No Text', () => (
    <Logo text="" />
  ))
  .add('Custom Text', () => (
    <Logo text="Some Message!" />
  ));
