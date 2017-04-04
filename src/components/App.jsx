import React from 'react';

import AdjacencyGraphContainer from './AdjacencyGraphContainer';

const App = () => (
  <div>
    <h2>Taxonomy Term Coincidence</h2>
    <AdjacencyGraphContainer
      width={600}
      height={600}
      types={['category']}
    />
  </div>
);

export default App;
