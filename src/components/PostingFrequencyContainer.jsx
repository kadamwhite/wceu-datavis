import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { descending } from '../utils/sort';

// import PunchCardGraph from './PunchCardGraph/PunchCardGraph';
import MonthHistogram from './MonthHistogram/MonthHistogram';

const mapStateToProps = state => ({
  posts: state.posts.byId,
});

function filterPostsByYear(posts, filter) {
  return filter !== 'all' ?
    Object.keys(posts).reduce((filtered, postId) => {
      const post = posts[postId];
      if (post.date.substr(0, 4) === filter) {
        return {
          ...filtered,
          [postId]: post,
        };
      }
      return filtered;
    }, {}) :
    posts;
}

class PostingFrequencyContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.onChangeYear = this.onChangeYear.bind(this);

    this.state = {
      filter: 'all',
    };
  }

  onChangeYear(event) {
    this.setState({
      filter: event.target.value,
    });
  }

  render() {
    const { posts } = this.props;
    const { filter } = this.state;
    const postIds = Object.keys(posts);
    const years = postIds.reduce((uniqueYears, postId) => {
      const postYear = posts[postId].date.substr(0, 4);
      return ! uniqueYears.includes(postYear) ?
        uniqueYears.concat(postYear) :
        uniqueYears;
    }, []).sort(descending);

    const filteredPosts = filterPostsByYear(posts, filter);
    return (
      <div>
        <h2>
          <label htmlFor="year-select">Posts By Month, </label>
          <select id="year-select" onChange={this.onChangeYear}>
            <option value="all">All Time</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select> ({Object.keys(filteredPosts).length} {filter === 'all' ? 'total' : `of ${postIds.length}`})
        </h2>
        <MonthHistogram
          posts={filteredPosts}
          width={700}
          height={400}
        />
        {/*
        <PunchCardGraph
          posts={posts}
          width={700}
          height={400}
        />
        */}
      </div>
    );
  }
}

PostingFrequencyContainer.propTypes = {
  posts: PropTypes.objectOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  })).isRequired,
};

export default connect(mapStateToProps)(PostingFrequencyContainer);
