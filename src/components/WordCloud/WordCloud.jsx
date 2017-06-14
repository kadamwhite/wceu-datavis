import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import * as d3 from 'd3';
import cloud from 'd3-cloud';

import styles from './WordCloud.styl';

const fill = d3.scaleOrdinal(d3.schemeCategory20b);

class WordCloud extends PureComponent {
  constructor(props) {
    super(props);

    this.update = this.update.bind(this);
    this.changeMode = this.changeMode.bind(this);

    this.state = {
      mode: 'cloud',
    };

    this.sizeScale = d3.scaleSqrt();
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    const { width, height, post, mode } = this.props;

    if (! post) {
      return;
    }

    const terms = post.terms
      .sort((a, b) => d3.descending(a[mode], b[mode]))
      .slice(0, 20);

    this.sizeScale
      .range([width / 30, width / 5])
      .domain(d3.extent(terms, d => d[mode]));

    const words = terms.map(term => ({
      text: term.term,
      size: this.sizeScale(term[mode]),
    }));

    this.layout = cloud()
      .size([width, height])
      .words(words)
      .padding(5)
      .rotate(0) // () => ~~(Math.random() * 2) * 90)
      .font('Impact')
      .fontSize(d => d.size)
      .on('end', this.update);

    this.layout.start();
  }

  update(words) {
    const { mode } = this.state;
    if (mode === 'cloud') {
      this.updateCloud(words);
    } else {
      this.updateList(words);
    }
  }

  changeMode() {
    this.setState(state => ({
      mode: state.mode === 'cloud' ? 'list' : 'cloud',
    }));
  }

  updateCloud(words) {
    const { width, height } = this.props;
    const text = d3.select(this.g)
      .selectAll('text')
        .data(words);
    text.enter()
      .append('text')
        .text(d => d.text)
        .on('click', this.changeMode)
      .merge(text)
        .style('font-size', d => `${d.size}px`)
        .style('font-family', 'Impact')
        .style('fill', (d, i) => fill(i))
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${[(width / 2) + d.x, (height / 2) + d.y]})`);
  }

  updateList(words) {
    const text = d3.select(this.g)
      .selectAll('text')
        .data(words);
    text.enter()
      .append('text')
        .text(d => d.text)
        .on('click', this.changeMode)
      .merge(text)
        .style('font-size', d => `${d.size}px`)
        .style('fill', (d, i) => fill(i))
        .attr('text-anchor', 'left')
        .attr('transform', d => `translate(0,${d.size})`);
  }

  render() {
    const { width, height, mode } = this.props;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };

    return (
      <div className={styles.container}>
        <p><strong>{
          mode === 'count' ? 'Top 20 by Count' : 'Top 20 by TF-IDF Score'
        }</strong></p>
        <svg
          className={styles.svg}
          width={width + margin.right + margin.left}
          style={{ maxHeight: height + margin.top + margin.bottom }}
          viewBox={`0,0,${width + margin.right + margin.left},${height + margin.top + margin.bottom}`}
        >
          <g
            ref={(node) => { this.g = node; }}
            transform={`translate(${margin.left},${margin.top})`}
          />
        </svg>
      </div>
    );
  }
}

WordCloud.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  post: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    categories: PropTypes.arrayOf(PropTypes.number).isRequired,
    terms: PropTypes.arrayOf(PropTypes.shape({
      term: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      count: PropTypes.number.isRequired,
      tfidf: PropTypes.number.isRequired,
    })).isRequired,
  }).isRequired,
  mode: PropTypes.string.isRequired,
};

WordCloud.defaultProps = {
  width: 400,
  height: 400,
};

export default WordCloud;
