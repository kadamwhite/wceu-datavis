import React from 'react';
import PropTypes from 'prop-types';

import * as d3 from 'd3';

import styles from './PostsPerYearGraph.styl';

function postsToDictionaryByMonth(posts) {
  return Object.keys(posts)
    .reduce((byDate, id) => {
      const post = posts[id];
      const date = post.date.substr(5, 2);
      return {
        ...byDate,
        [date]: (byDate[date] || []).concat(post),
      };
    }, {});
}

const months = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  10: 'October',
  11: 'November',
  12: 'December',
};

const MonthHistogram = ({ width, height, labels, posts }) => {
  const margin = { top: 30, right: 10, bottom: 50, left: 10 };
  const postsByMonth = postsToDictionaryByMonth(posts);

  function getMonthCount(key) {
    return (postsByMonth[key] && postsByMonth[key].length) || 0;
  }

  const monthKeys = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  const xScale = d3.scaleBand()
    .paddingInner(0.1)
    .rangeRound([0, width])
    .domain(monthKeys);

  const maxPostCountForMonth = d3.max(monthKeys, getMonthCount);
  const yScale = d3.scaleLinear()
    .range([height - margin.top - margin.bottom, 0])
    .domain([0, maxPostCountForMonth]);

  return (
    <svg
      className={styles.svg}
      width={width}
      style={{ maxHeight: height }}
      viewBox={`0,0,${width},${height}`}
    >
      <g transform={`translate(${margin.left},${margin.top})`}>
        {monthKeys.map((key) => {
          const count = getMonthCount(key);
          const bandwidth = xScale.bandwidth();
          const barHeight = yScale(count) || 1;
          const chartHeight = height - margin.top - margin.bottom;
          return (
            <g
              key={`${key}`}
              transform={`translate(${xScale(key)},0)`}
            >
              <rect
                className={styles.rect}
                x={0}
                y={barHeight}
                width={bandwidth}
                height={yScale.range()[0] - barHeight}
              />
              {labels ? <text
                fontSize={Math.max(18, Math.floor(bandwidth * 0.4))}
                x={bandwidth / 2}
                y={-10}
                textAnchor="middle"
              >
                {count || ''}
              </text> : null}
              {labels ? <text
                className={styles.monthLabel}
                fontSize={Math.max(18, Math.floor(bandwidth * 0.6))}
                alignmentBaseline="middle"
                transform={[
                  `translate(0,${chartHeight})`,
                  'rotate(-90)',
                  `translate(5,${bandwidth / 2})`,
                ].join(',')}
              >
                {months[key]}
              </text> : null}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

MonthHistogram.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  labels: PropTypes.bool,
  posts: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  })).isRequired,
};

MonthHistogram.defaultProps = {
  width: 720,
  height: 720,
  labels: true,
};

export default MonthHistogram;
