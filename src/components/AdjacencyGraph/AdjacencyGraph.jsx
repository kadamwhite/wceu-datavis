/* eslint-disable  react/no-unused-prop-types */// Cannot detect shouldComponentUpdate usage
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { scaleBand, scaleSequential, max } from 'd3';
import { interpolateYlGn } from 'd3-scale-chromatic';

import { ascending, descending } from '../../utils/sort';
import { valueChanged } from '../../utils/object';
import { getCoincidenceCount } from '../../redux/reducers';

import styles from './AdjacencyGraph.styl';

class AdjacencyGraph extends Component {
  constructor(props) {
    super(props);

    this.x = scaleBand();
    this.color = scaleSequential(interpolateYlGn);

    this.onChangeSort = this.onChangeSort.bind(this);

    this.state = {
      sort: 'alphabetical',
    };

    this.updateScales(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('shouldComponentUpdate');
    if (valueChanged(this.props, nextProps, ['matrix', 'nodes', 'types', 'width'])) {
      console.log('props changed');
      this.updateScales(nextProps);
      return true;
    }
    if (this.state.sort !== nextState.sort) {
      console.log('state changed');
      // Set the domain for the x/y position scale & ensure its range is up-to-date
      this.x.domain(this.sortNodeIdsBy(nextState.sort));
      return true;
    }
    return false;
  }

  onChangeSort(event) {
    console.log('onChangeSort');
    this.setState({
      sort: event.target.value,
    });
  }

  sortNodeIdsBy(sortType) {
    console.log('sortNodeIdsBy');
    // Alphabetical is default
    const sortFn = sortType === 'count' ?
      (a, b) => descending(+a.count, +b.count) :
      (a, b) => ascending(a.title.toLowerCase(), b.title.toLowerCase());

    return this.nodes.sort(sortFn).map(node => node.id);
  }

  updateScales(props) {
    console.log('updateScales');
    const { matrix, nodes, types, width } = props;

    this.nodeIds = Object.keys(nodes)
      .filter((id) => {
        if (! types.includes(nodes[id].type)) {
          return false;
        }
        if (nodes[id].type === 'post_tag') {
          // Omit tags with only one post, so that it's not an unwieldy number
          if (nodes[id].count <= 1) {
            return false;
          }
          // Omit "featured-" tags, which are an internal artifact of the site
          // on which this is being prototyped
          if (nodes[id].title && nodes[id].title.match(/^featured-/)) {
            return false;
          }
        }
        return true;
      });

    // Convert ID list to an array of node objects & sort by the active parameter
    this.nodes = this.nodeIds.map(id => nodes[id]);

    // Set the domain for the x/y position scale & ensure its range is up-to-date
    this.x.rangeRound([0, width]).domain(this.sortNodeIdsBy(this.state.sort));

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
    const { x, color, nodes } = this;

    return (
      <div className={styles.container}>
        <form>
          <label htmlFor="adjacency-sort-order">Sort</label>
          <select onChange={this.onChangeSort} id="adjacency-sort-order">
            <option value="alphabetical">Alphabetically</option>
            <option value="count">by Post Count</option>
          </select>
        </form>
        <svg
          width={`${width + margin.left + margin.right}px`}
          height={`${height + margin.top + margin.bottom}px`}
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            <rect
              className={styles.background}
              width={width}
              height={height}
            />
            {/* Column labels */}
            {nodes.map(node => (
              <text
                key={`label${node.id}`}
                className={styles.label}
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
              <g className={styles.group} key={`row${node.id}`} transform={`translate(0,${x(node.id)})`}>
                {/* Row label */}
                <text
                  className={styles.label}
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
    // link: PropTypes.string.isRequired,
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
