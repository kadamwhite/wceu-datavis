import { connect } from 'react-redux';

import AdjacencyGraph from './AdjacencyGraph/AdjacencyGraph';

const mapStateToProps = state => ({
  matrix: state.matrix,
  nodes: state.nodes,
});

export default connect(mapStateToProps)(AdjacencyGraph);
