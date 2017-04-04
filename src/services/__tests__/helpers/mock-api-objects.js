export const post = {
  id: 503,
  date: '2017-03-27T01:14:52',
  date_gmt: '2017-03-27T01:14:52',
  guid: {
    rendered: 'https://demo.wp-api.org/?p=503',
  },
  modified: '2017-03-27T01:14:52',
  modified_gmt: '2017-03-27T01:14:52',
  slug: 'testpost',
  status: 'publish',
  type: 'post',
  link: 'https://demo.wp-api.org/2017/03/27/testpost/',
  title: {
    rendered: 'A Test Post',
  },
  content: {
    rendered: '<p>content content</p>\n',
    protected: false,
  },
  excerpt: {
    rendered: '<p>content content</p>\n',
    protected: false,
  },
  author: 226,
  featured_media: 0,
  comment_status: 'open',
  ping_status: 'open',
  sticky: false,
  template: '',
  format: 'standard',
  meta: [],
  categories: [1],
  tags: [],
  liveblog_likes: 0,
  _links: {
    self: [{
      href: 'https://demo.wp-api.org/wp-json/wp/v2/posts/503',
    }],
    collection: [{
      href: 'https://demo.wp-api.org/wp-json/wp/v2/posts',
    }],
    about: [{
      href: 'https://demo.wp-api.org/wp-json/wp/v2/types/post',
    }],
    author: [{
      embeddable: true,
      href: 'https://demo.wp-api.org/wp-json/wp/v2/users/226',
    }],
    replies: [{
      embeddable: true,
      href: 'https://demo.wp-api.org/wp-json/wp/v2/comments?post=503',
    }],
    'version-history': [{
      href: 'https://demo.wp-api.org/wp-json/wp/v2/posts/503/revisions',
    }],
    'wp:attachment': [{
      href: 'https://demo.wp-api.org/wp-json/wp/v2/media?parent=503',
    }],
    'wp:term': [{
      taxonomy: 'category',
      embeddable: true,
      href: 'https://demo.wp-api.org/wp-json/wp/v2/categories?post=503',
    }, {
      taxonomy: 'post_tag',
      embeddable: true,
      href: 'https://demo.wp-api.org/wp-json/wp/v2/tags?post=503',
    }],
    curies: [{
      name: 'wp',
      href: 'https://api.w.org/{rel}',
      templated: true,
    }],
  },
};

export const category = {
  id: 7,
  count: 3,
  description: 'Some Category',
  link: 'https://demo.wp-api.org/category/test-category/',
  name: 'Test Category',
  slug: 'test-category',
  taxonomy: 'category',
  parent: 6,
  meta: [],
  _links: {
    self: [{
      href: 'https://demo.wp-api.org/wp-json/wp/v2/categories/7',
    }],
    collection: [{
      href: 'https://demo.wp-api.org/wp-json/wp/v2/categories',
    }],
    about: [{
      href: 'https://demo.wp-api.org/wp-json/wp/v2/taxonomies/category',
    }],
    up: [{
      embeddable: true,
      href: 'https://demo.wp-api.org/wp-json/wp/v2/categories/6',
    }],
    'wp:post_type': [{
      href: 'https://demo.wp-api.org/wp-json/wp/v2/posts?categories=7',
    }],
    curies: [{
      name: 'wp',
      href: 'https://api.w.org/{rel}',
      templated: true,
    }],
  },
};

export const tag = {
  id: 2,
  count: 8,
  description: 'Description Here',
  link: 'https://demo.wp-api.org/tag/test-tag/',
  name: 'Test Tag',
  slug: 'test-tag',
  taxonomy: 'post_tag',
  meta: [],
  _links: {
    self: [{
      href: 'https://demo.wp-api.org/wp-json/wp/v2/tags/2',
    }],
    collection: [{
      href: 'https://demo.wp-api.org/wp-json/wp/v2/tags',
    }],
    about: [{
      href: 'https://demo.wp-api.org/wp-json/wp/v2/taxonomies/post_tag',
    }],
    'wp:post_type': [{
      href: 'https://demo.wp-api.org/wp-json/wp/v2/posts?tags=2',
    }],
    curies: [{
      name: 'wp',
      href: 'https://api.w.org/{rel}',
      templated: true,
    }],
  },
};
