import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import AdjacencyGraph from './AdjacencyGraph/AdjacencyGraph';

const mapStateToProps = state => ({
  matrix: state.matrix,
  nodes: state.nodes,
});

const AdjacencyGraphContainer = ({ matrix, nodes }) => (
  <div>
    <h2>Tag & Category Term Co-occurrence Matrix</h2>
    <AdjacencyGraph
      matrix={matrix}
      nodes={nodes}
      width={700}
      height={700}
      types={['post_tag', 'category']}
    />
  </div>
);

AdjacencyGraphContainer.propTypes = {
  matrix: PropTypes.objectOf(PropTypes.objectOf(PropTypes.number)).isRequired,
  nodes: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    // link: PropTypes.string.isRequired,
    title: PropTypes.string,
    type: PropTypes.string.isRequired,
  })).isRequired,
};

export default connect(mapStateToProps)(AdjacencyGraphContainer);
