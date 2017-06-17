import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  // d3-selection
  select,
  mouse,
  // d3-force
  forceSimulation,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceLink,
} from 'd3';

import debounce from 'lodash.debounce';
import styles from './ForceDirectedGraph.styl';
import { getCoincidenceCount } from '../../redux/reducers';

const classSelectors = Object.keys(styles)
  .reduce((selectors, className) => Object.assign({
    [className]: `.${styles[className]}`,
  }, selectors), {});

function radius(d) {
  return d.type === 'post_tag' ? 5 : 10;
}

// function isTerm(node) {
//   return node.type === 'category' || node.type === 'tag' || node.type === 'post_tag';
// }

class ForceDirectedGraph extends PureComponent {

  constructor(props) {
    super(props);

    this.graph = {
      nodes: [],
      edges: [],
      nodesMap: {},
    };

    this.state = {
      selectedNode: null,
    };
  }

  componentDidMount() {
    this.initSimulation();

    if (Object.keys(this.props.nodes).length) {
      // Data is pre-loaded! Let's get things going
      this.makeNodes();
      this.runSimulation();
    }
  }

  componentDidUpdate() {
    this.makeNodes();
    this.runSimulation();
  }

  isSelectedNode(id) {
    const { selectedNode } = this.state;
    return ! ! (selectedNode && (selectedNode.id === id));
  }

  tooltip(node) {
    select(this.svg).select('text').text(node.title.replace(/scholoarships/, 'scholarships'));
  }

  runSimulation() {
    if (this.simulation) {
      this.simulation.stop();
    }

    const { selectedNode } = this.state;
    const graph = this.graph;

    const svg = select(this.svg);
    const linksGroup = svg.select('.edges');
    const nodesGroup = svg.select('.nodes');

    const displayEdges = selectedNode ?
      graph.edges.filter(edge => (
        ! this.isSelectedNode(edge.source) && ! this.isSelectedNode(edge.target)
      )) :
      graph.edges;

    const links = linksGroup
      .selectAll('line')
      .data(displayEdges, (d) => {
        const { source, target } = d;
        return [source, target].sort().join();
      });
    links.exit()
      .remove();
    links.enter().append('line')
      .attr('stroke-width', d => Math.sqrt(d.count))
      .classed(styles.edge, true);

    const nodes = nodesGroup
      .selectAll('circle')
      .data(graph.nodes, d => d.id);
    nodes.exit().remove();
    /* eslint-disable no-shadow */// Need to re-declare selectedNode
    const enteringNodes = nodes.enter().append('circle')
      .attr('title', d => d.id)
      .on('click', (d) => {
        if (this.isSelectedNode(d.id)) {
          this.setState({
            selectedNode: null,
          }, this.runSimulation);
        } else {
          this.setState({
            selectedNode: d,
          }, this.runSimulation);
        }
      });
    nodes.merge(enteringNodes)
      .attr('r', d => radius(d))
      .attr('class', d => `${styles.node} ${styles[d.type]}`)
      .classed(styles.selected, d => this.isSelectedNode(d.id));

    this.simulation.nodes(graph.nodes);
    this.simulation.force('links').links(graph.edges);
    this.simulation.alpha(0.3).restart();
  }

  initSimulation() {
    const { width, height } = this.props;
    this.centeringForce = forceCenter()
      .x(width / 2)
      .y(height / 2);

    this.chargeForce = forceManyBody().strength(-1000);

    this.collisionForce = forceCollide()
      .radius(d => 5 + (d.type === 'post' ? 5 : 10));

    this.linkForce = forceLink()
      .id(d => d.id)
      // .strength(0)
      .iterations(5);

    const svg = select(this.svg);
    const linksGroup = svg.select('.edges');
    const nodesGroup = svg.select('.nodes');

    let tickCount = 0;
    this.simulation = forceSimulation()
      .alpha(0.1)
      .velocityDecay(0.2)
      .force('center', this.centeringForce)
      .force('charge', this.chargeForce)
      .force('collide', this.collisionForce)
      .force('links', this.linkForce)
      // eslint-disable-next-line prefer-arrow-callback
      .on('tick', function onTick() {
        // Update on every other tick;
        if (tickCount < 2) {
          tickCount += 1;
          return;
        }
        linksGroup.selectAll(classSelectors.edge)
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        nodesGroup.selectAll(classSelectors.node)
          .attr('transform', (d) => {
            // See https://bl.ocks.org/mbostock/1129492 -- constrain the position
            // of nodes within the rectangular bounds of the containing SVG element.
            // As a side-effect of updating the node's cx and cy attributes, we
            // update the node positions to be within the range [radius, width - radius]
            // for x, [radius, height - radius] for y.
            /* eslint-disable no-param-reassign */
            d.x = Math.max(radius(d), Math.min(width - radius(d), d.x));
            d.y = Math.max(radius(d), Math.min(height - radius(d), d.y));
            /* eslint-enable no-param-reassign */
            return `translate(${d.x},${d.y})`;
          });

        tickCount = 0;
      });

    const selectNearest = debounce(([x, y]) => {
      const node = this.simulation.find(x, y, 50);
      if (! node) {
        // svg.selectAll(classSelectors.node).classed(styles.hover, false);
        return;
      }
      svg.selectAll(classSelectors.node).classed(styles.hover, d => d === node);
      this.tooltip(node);
    }, 10);
    svg.on('mousemove', function onMouseMove() {
      selectNearest(mouse(this));
    });
  }

  makeNodes() {
    const { width, height, matrix } = this.props;
    const oldNodesMap = this.graph.nodesMap;

    // We will be updating this.graph with new properties
    const nodesMap = { ...this.props.nodes };
    const nodes = [];
    const edges = [];

    // Function to retrieve an existing node, if present, so that X & Y are
    // preserved, but other values updated; otherwise, the provided node is
    // new and therefore added to the new node list as-is.
    // Returns the node.
    function createOrUpdateNode(node) {
      const newNode = oldNodesMap[node.id] ?
        Object.assign(oldNodesMap[node.id], node) :
        Object.assign({
          // Initial position in center
          x: width / 2,
          y: height / 2,
        }, node);
      nodesMap[newNode.id] = newNode;
      nodes.push(newNode);
    }

    const uniqueTypes = {};

    // Populate new array and dictionary with taxonomy information
    Object.keys(nodesMap).map(id => nodesMap[id]).forEach((term) => {
      createOrUpdateNode({
        title: term.title,
        id: term.id,
        description: term.description,
        count: term.count,
        type: term.type,
      });
      uniqueTypes[term.type] = true;
    });

    nodes.forEach((node) => {
      if (! matrix[node.id]) {
        return;
      }
      Object.keys(matrix[node.id]).forEach((coincidentNodeId) => {
        const count = getCoincidenceCount({ matrix }, node.id, coincidentNodeId);
        const coincidentNode = nodesMap[coincidentNodeId];

        if (coincidentNode.title.match(/^featured-/) || coincidentNode.title.toLowerCase() === 'bocoup') {
          return;
        }
        edges.push({
          source: node.id,
          target: coincidentNodeId,
          count,
        });
      });
    });

    // Update graph object
    this.graph.nodes = nodes;
    this.graph.nodesMap = nodesMap;
    this.graph.edges = edges;

    return this.graph;
  }

  render() {
    const { width, height } = this.props;

    return (
      <div>
        <svg
          ref={(node) => { this.svg = node; }}
          width={`${width}px`}
          height={`${height}px`}
        >
          <text className={styles.tooltip} x={width / 2} y={30} />
          <g className="edges" />
          <g className="nodes" />
        </svg>
      </div>
    );
  }
}

ForceDirectedGraph.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  // types: PropTypes.arrayOf(PropTypes.string),
  matrix: PropTypes.objectOf(PropTypes.objectOf(PropTypes.number)).isRequired,
  nodes: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    // link: PropTypes.string.isRequired,
    title: PropTypes.string,
    type: PropTypes.string.isRequired,
  })).isRequired,
};

ForceDirectedGraph.defaultProps = {
  width: 720,
  height: 720,
  // types: ['category', 'post_tag'],
};

export default ForceDirectedGraph;
