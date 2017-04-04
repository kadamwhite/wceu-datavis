import React, { PropTypes, Component } from 'react';
import { scaleBand, scaleSequential, max } from 'd3';
import { interpolateYlGn } from 'd3-scale-chromatic';

import ascending from '../../utils/ascending-sort';
import { getCoincidenceCount } from '../../redux/reducers';

import styles from './AdjacencyGraph.styl';

class AdjacencyGraph extends Component {
  constructor(props) {
    console.log('constructor');
    super(props);

    this.x = scaleBand();
    this.color = scaleSequential(interpolateYlGn);

    this.state = {
      sort: 'alphabetical',
    };
  }

  updateScales() {
    console.log('updateScales');
    const { matrix, nodes, types, width } = this.props;

    const nodeIds = Object.keys(nodes)
      .filter((id) => {
        // Omit tags with only one post, so that it's not an unwieldy number
        if (nodes[id].type === 'post_tag' && nodes[id].count <= 1) {
          return false;
        }
        return types.includes(nodes[id].type);
      });
    this.nodes = nodeIds
      .map(id => nodes[id])
      .sort((node1, node2) => ascending(node1.title, node2.title));

    // Set the domain for the x/y position scale & ensure its range is up-to-date
    this.x.rangeRound([0, width]).domain(nodeIds);

    const maxValue = max(this.nodes, node =>
      max(this.nodes, coincidentNode =>
        getCoincidenceCount({ matrix }, node.id, coincidentNode.id)));

    // Set the domain for the color scale
    this.color.domain([1, maxValue]);
  }

  render() {
    console.log('render');
    const margin = { top: 150, right: 0, bottom: 10, left: 200 };
    const { width, height, matrix } = this.props;

    // Local references to instance property values
    this.updateScales();
    const { x, color, nodes } = this;

    return (
      <div>
        <svg
          width={`${width + margin.left + margin.right}px`}
          height={`${height + margin.top + margin.bottom}px`}
        >
          <g
            ref={(node) => { this.g = node; }}
            transform={`translate(${margin.left},${margin.top})`}
          >
            <rect
              className={styles.background}
              width={width}
              height={height}
            />
            {/* Column labels */}
            {nodes.map(node => (
              <text
                key={`label${node.id}`}
                x={6}
                y={x.bandwidth() / 2}
                transform={`translate(${x(node.id)})rotate(-90)`}
                dy="0.32em"
                fontSize="0.70rem"
                textAnchor="start"
              >
                {node.title}
              </text>
            ))}
            {/* Row groups */}
            {nodes.map(node => (
              <g key={`row${node.id}`} transform={`translate(0,${x(node.id)})`}>
                {/* Row label */}
                <text
                  x={-6}
                  y={x.bandwidth() / 2}
                  dy="0.32em"
                  fontSize="0.70rem"
                  textAnchor="end"
                >
                  {node.title}
                </text>
                {/* Row cells */}
                {nodes.map((coincidentNode) => {
                  const value = getCoincidenceCount({ matrix }, node.id, coincidentNode.id);
                  return (
                    <rect
                      className={styles.cell}
                      key={`${node.id}${coincidentNode.id}`}
                      x={x(coincidentNode.id)}
                      y={0}
                      width={x.bandwidth()}
                      height={x.bandwidth()}
                      title={`${value} co-occurrence${value === 1 ? '' : 's'}`}
                      fill={value ? color(value) : 'white'}
                    />
                  );
                })}
              </g>
            ))}
          </g>
        </svg>
      </div>
    );
  }
}

AdjacencyGraph.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  types: PropTypes.arrayOf(PropTypes.string),
  matrix: PropTypes.objectOf(PropTypes.objectOf(PropTypes.number)).isRequired,
  nodes: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    title: PropTypes.string,
    type: PropTypes.string.isRequired,
  })).isRequired,
};

AdjacencyGraph.defaultProps = {
  width: 720,
  height: 720,
  types: ['category', 'post_tag'],
};

export default AdjacencyGraph;
