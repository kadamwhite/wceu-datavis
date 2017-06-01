import React from 'react';
import PropTypes from 'prop-types';

import { descending } from '../../utils/sort';

function postsToDictionaryByDate(posts) {
  return Object.keys(posts)
    .reduce((byDate, id) => {
      const post = posts[id];
      const date = post.date.substr(5, 5);
      return {
        ...byDate,
        [date]: (byDate[date] || []).concat(post),
      };
    }, {});
}

const PunchCardGraph = ({ width, height, posts }) => {
  const postsByDate = postsToDictionaryByDate(posts);
  return (
    <div width={width} height={height}>
      {Object.keys(postsByDate).sort(descending).map(date => (
        <div key={`${date}`}>
          <p><strong>{date}</strong></p>
          {postsByDate[date].map(post => (
            <p key={`${post.id}`}>{post.title}</p>
          ))}
        </div>
      ))}
    </div>
  );
};

PunchCardGraph.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  posts: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.oneOf([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  })).isRequired,
};

PunchCardGraph.defaultProps = {
  width: 720,
  height: 720,
};

export default PunchCardGraph;
