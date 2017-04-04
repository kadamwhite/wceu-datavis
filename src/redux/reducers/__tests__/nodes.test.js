import nodes from '../nodes';
import * as actions from '../../actions';

describe('nodes reducer', () => {

  it('is a function', () => {
    expect(nodes).toBeDefined();
    expect(nodes).toBeInstanceOf(Function);
  });

  it('initializes a default state object', () => {
    const state = nodes(undefined, {});
    expect(state).toBeDefined();
    expect(state).toEqual({});
  });

  it('does not mutate the state when no action is provided', () => {
    const state = nodes(undefined, {});
    Object.freeze(state);
    expect(nodes(state, {})).toBe(state);
  });

  const { RECEIVE_CATEGORIES } = actions;
  describe(`on ${RECEIVE_CATEGORIES}`, () => {
    const initialState = nodes(undefined, {});

    it('populates the dictionary of categories by ID', () => {
      const payload = [
        { id: 2, name: 'Category 2', taxonomy: 'category', link: '/cat/2', count: 2 },
        { id: 1, name: 'Category 1', taxonomy: 'category', link: '/cat/1', count: 7 },
      ];
      const nextState = nodes(initialState, {
        type: RECEIVE_CATEGORIES,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState).toBeDefined();
      expect(nextState).toEqual({
        t1: { id: 't1', title: 'Category 1', type: 'category', link: '/cat/1', count: 7 },
        t2: { id: 't2', title: 'Category 2', type: 'category', link: '/cat/2', count: 2 },
      });
    });

    it('adds new categories to dictionary', () => {
      const payload = [
        { id: 3, name: 'Category 3', taxonomy: 'category', link: '/cat/3', count: 7 },
        { id: 4, name: 'Category 4', taxonomy: 'category', link: '/cat/4', count: 2 },
      ];
      const nextState = nodes({
        t1: { id: 't1', title: 'Category 1', type: 'category', link: '/cat/1', count: 1 },
        t2: { id: 't2', title: 'Tag 2', type: 'post_tag', link: '/tag/2', count: 13 },
      }, {
        type: RECEIVE_CATEGORIES,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState).toBeDefined();
      expect(nextState).toEqual({
        t1: { id: 't1', title: 'Category 1', type: 'category', link: '/cat/1', count: 1 },
        t2: { id: 't2', title: 'Tag 2', type: 'post_tag', link: '/tag/2', count: 13 },
        t3: { id: 't3', title: 'Category 3', type: 'category', link: '/cat/3', count: 7 },
        t4: { id: 't4', title: 'Category 4', type: 'category', link: '/cat/4', count: 2 },
      });
    });

    it('updates existing categories in dictionary', () => {
      const payload = [
        { id: 2, name: 'Category 2+', taxonomy: 'category', link: '/cat/2', count: 3 },
      ];
      const nextState = nodes({
        t1: { id: 't1', title: 'Category 1', type: 'category', link: '/cat/1', count: 7 },
        t2: { id: 't2', title: 'Category 2', type: 'category', link: '/cat/2', count: 2 },
      }, {
        type: RECEIVE_CATEGORIES,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState).toBeDefined();
      expect(nextState).toEqual({
        t1: { id: 't1', title: 'Category 1', type: 'category', link: '/cat/1', count: 7 },
        t2: { id: 't2', title: 'Category 2+', type: 'category', link: '/cat/2', count: 3 },
      });
    });

  });

  const { RECEIVE_TAGS } = actions;
  describe(`on ${RECEIVE_TAGS}`, () => {
    const initialState = nodes(undefined, {});

    it('populates the dictionary of tags by ID', () => {
      const payload = [
        { id: 2, name: 'Tag 2', taxonomy: 'post_tag', link: '/tag/2', count: 2 },
        { id: 1, name: 'Tag 1', taxonomy: 'post_tag', link: '/tag/1', count: 7 },
      ];
      const nextState = nodes(initialState, {
        type: RECEIVE_TAGS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState).toBeDefined();
      expect(nextState).toEqual({
        t1: { id: 't1', title: 'Tag 1', type: 'post_tag', link: '/tag/1', count: 7 },
        t2: { id: 't2', title: 'Tag 2', type: 'post_tag', link: '/tag/2', count: 2 },
      });
    });

    it('adds new tags to dictionary', () => {
      const payload = [
        { id: 3, name: 'Tag 3', taxonomy: 'post_tag', link: '/tag/3', count: 31 },
        { id: 4, name: 'Tag 4', taxonomy: 'post_tag', link: '/tag/4', count: 3 },
      ];
      const nextState = nodes({
        t1: { id: 't1', title: 'Category 1', type: 'category', link: '/cat/1', count: 1 },
        t2: { id: 't2', title: 'Tag 2', type: 'post_tag', link: '/tag/2', count: 9 },
      }, {
        type: RECEIVE_TAGS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState).toBeDefined();
      expect(nextState).toEqual({
        t1: { id: 't1', title: 'Category 1', type: 'category', link: '/cat/1', count: 1 },
        t2: { id: 't2', title: 'Tag 2', type: 'post_tag', link: '/tag/2', count: 9 },
        t3: { id: 't3', title: 'Tag 3', type: 'post_tag', link: '/tag/3', count: 31 },
        t4: { id: 't4', title: 'Tag 4', type: 'post_tag', link: '/tag/4', count: 3 },
      });
    });

    it('updates existing tags in dictionary', () => {
      const payload = [
        { id: 2, name: 'Tag 2+', taxonomy: 'post_tag', link: '/tag/2', count: 3 },
      ];
      const nextState = nodes({
        t1: { id: 't1', title: 'Tag 1', type: 'post_tag', link: '/tag/1', count: 1 },
        t2: { id: 't2', title: 'Tag 2', type: 'post_tag', link: '/tag/2', count: 1 },
      }, {
        type: RECEIVE_TAGS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState).toBeDefined();
      expect(nextState).toEqual({
        t1: { id: 't1', title: 'Tag 1', type: 'post_tag', link: '/tag/1', count: 1 },
        t2: { id: 't2', title: 'Tag 2+', type: 'post_tag', link: '/tag/2', count: 3 },
      });
    });

  });

  const { RECEIVE_POSTS } = actions;
  describe(`on ${RECEIVE_POSTS}`, () => {
    const initialState = nodes(undefined, {});

    it('populates the dictionary of posts by ID', () => {
      const payload = [
        { id: 1, title: { rendered: 'Post 1' }, type: 'post', link: '/permalink' },
        { id: 2, title: { rendered: 'Post 2' }, type: 'post', link: '/permalink' },
      ];
      const nextState = nodes(initialState, {
        type: RECEIVE_POSTS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState).toBeDefined();
      expect(nextState).toEqual({
        1: { id: '1', title: 'Post 1', type: 'post', link: '/permalink', count: 0 },
        2: { id: '2', title: 'Post 2', type: 'post', link: '/permalink', count: 0 },
      });
    });

    it('adds new posts to dictionary', () => {
      const payload = [
        { id: 3, title: { rendered: 'Post 3' }, type: 'post', link: '/permalink' },
        { id: 4, title: { rendered: 'Post 4' }, type: 'post', link: '/permalink' },
      ];
      const nextState = nodes({
        t1: { id: 't1', title: 'Category 1', type: 'category', link: '/cat/1', count: 2 },
        2: { id: '2', title: 'Post 2', type: 'post', link: '/permalink', count: 0 },
      }, {
        type: RECEIVE_POSTS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState).toBeDefined();
      expect(nextState).toEqual({
        t1: { id: 't1', title: 'Category 1', type: 'category', link: '/cat/1', count: 2 },
        2: { id: '2', title: 'Post 2', type: 'post', link: '/permalink', count: 0 },
        3: { id: '3', title: 'Post 3', type: 'post', link: '/permalink', count: 0 },
        4: { id: '4', title: 'Post 4', type: 'post', link: '/permalink', count: 0 },
      });
    });

    it('updates existing posts in dictionary', () => {
      const payload = [
        { id: 2, title: { rendered: 'Post 2+' }, type: 'post', link: '/permalink' },
      ];
      const nextState = nodes({
        1: { id: '1', title: 'Post 1', type: 'post', link: '/permalink', count: 0 },
        2: { id: '2', title: 'Post 2', type: 'post', link: '/permalink', count: 0 },
      }, {
        type: RECEIVE_POSTS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState).toBeDefined();
      expect(nextState).toEqual({
        1: { id: '1', title: 'Post 1', type: 'post', link: '/permalink', count: 0 },
        2: { id: '2', title: 'Post 2+', type: 'post', link: '/permalink', count: 0 },
      });
    });

  });

});
