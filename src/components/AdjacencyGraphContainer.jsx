import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { select } from 'd3';

import AdjacencyGraph from './AdjacencyGraph/AdjacencyGraph';
import ForceDirectedGraph from './ForceDirectedGraph/ForceDirectedGraph';

const mapStateToProps = state => ({
  matrix: state.matrix,
  nodes: state.nodes,
});

class AdjacencyGraphContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.onHoverGraphNode = this.onHoverGraphNode.bind(this);
  }

  onHoverGraphNode(node) {
    select(this.hoveredItem).text(node.title);
  }

  render() {
    const { matrix, nodes } = this.props;
    return (
      <div>
        <h2>Tag & Category Term Co-occurrence Matrix</h2>
        <AdjacencyGraph
          matrix={matrix}
          nodes={nodes}
          width={700}
          height={700}
          types={['post_tag', 'category']}
        />
        <ForceDirectedGraph
          matrix={matrix}
          nodes={nodes}
          width={700}
          height={700}
          types={['post_tag']}
          onMouseOver={this.onHoverGraphNode}
        />
        <p ref={(node) => { this.hoveredItem = node; }} />
      </div>
    );
  }
}

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
