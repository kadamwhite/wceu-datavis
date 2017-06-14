import React, { PureComponent } from 'react';
import * as d3 from 'd3';

import WordCloud from './WordCloud/WordCloud';

const { WPAPI_SETTINGS } = global;

class PostingFrequencyContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.onChangeMode = this.onChangeMode.bind(this);

    this.state = {
      posts: [],
      categories: [],
      mode: 'count',
      err: null,
    };
  }

  componentDidMount() {
    d3.json(`${WPAPI_SETTINGS.endpoint}wceu/2017/posts/tf-idf`, (err, data) => {
      if (err) {
        this.setState({ err });
        return;
      }
      this.setState({
        posts: data,
      });
    });
    d3.json(`${WPAPI_SETTINGS.endpoint}wceu/2017/categories/tf-idf`, (err, data) => {
      if (err) {
        this.setState({ err });
        return;
      }
      this.setState({
        categories: data,
      });
    });
  }

  onChangeMode(event) {
    this.setState({
      mode: event.target.value,
    });
  }

  render() {
    const { categories, err, posts: postDictionary } = this.state;
    const posts = Object.keys(postDictionary)
      .map(id => postDictionary[id])
      .sort((a, b) => d3.descending(new Date(a.date), new Date(b.date)))
      // 20 newest posts
      .slice(0, 20);

    if (err) {
      return (
        <div>
          <h2>An error occurred while loading the data!</h2>
          <pre>{err.stack}</pre>
        </div>
      );
    }

    /* eslint-disable max-len */
    return (
      <div>
        <h2>Top Terms By Post</h2>
        <p>This page compares the top words as selected by raw frequency <em>vs</em> Term Frequency-Inverse Document Frequency (TF-IDF) calculation</p>
        {posts.map(p => (
          <div key={p.id}>
            <h3>{p.title}</h3>
            <WordCloud
              post={p}
              width={300}
              height={250}
              mode="count"
            />
            <WordCloud
              post={p}
              width={300}
              height={250}
              mode="tfidf"
            />
          </div>
        ))}
        <h2>Top Terms By Category</h2>
        {categories.map(c => (
          <div key={c.id}>
            <h3>{c.title}</h3>
            <WordCloud
              post={c}
              width={300}
              height={250}
              mode="count"
            />
            <WordCloud
              post={c}
              width={300}
              height={250}
              mode="tfidf"
            />
          </div>
        ))}
      </div>
    );
    /* eslint-enable max-len */
  }
}

export default PostingFrequencyContainer;
