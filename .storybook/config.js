import { configure, addDecorator } from '@kadira/storybook';
import { withRouterContext } from './decorators';

addDecorator(withRouterContext);

// We write our stories as *.stories.jsx files that live alongside the
// component that they exercise. The logic in this function finds all
// *.stories.jsx files within our front-end source directory and executes
// them; each file should call `storiesOf('ProgressBar', module)` in the
// normal fashion described in the Storybook documentation.
function loadStories() {
  // Reassure ESLint that this async require is intentional
  // eslint-disable-next-line global-require
  const req = require.context('../src', true, /\.stories\.jsx$/);
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
