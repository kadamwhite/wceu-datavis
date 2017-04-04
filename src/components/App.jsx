import React from 'react';

import AdjacencyGraphContainer from './AdjacencyGraphContainer';

const App = () => (
  <div>
    <h2>Taxonomy Term Coincidence</h2>
    <AdjacencyGraphContainer
      width={700}
      height={700}
      types={['post_tag', 'category']}
    />
  </div>
);

export default App;
