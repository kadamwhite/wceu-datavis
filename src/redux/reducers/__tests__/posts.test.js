import posts, * as selectors from '../posts';
import * as actions from '../../actions';

describe('posts reducer', () => {

  it('is a function', () => {
    expect(posts).toBeDefined();
    expect(posts).toBeInstanceOf(Function);
  });

  it('initializes a default state object', () => {
    const state = posts(undefined, {});
    expect(state).toBeDefined();
    expect(state).toEqual({
      byId: {},
      order: [],
    });
  });

  it('does not mutate the state when no action is provided', () => {
    const state = posts(undefined, {});
    Object.freeze(state);
    expect(posts(state, {})).toBe(state);
  });

  const { RECEIVE_POSTS } = actions;
  describe(`on ${RECEIVE_POSTS}`, () => {
    const initialState = posts(undefined, {});

    it('populates the dictionary of posts by ID', () => {
      const payload = [
        { id: 2, title: 'Post 2' },
        { id: 1, title: 'Post 1' },
      ];
      const nextState = posts(initialState, {
        type: RECEIVE_POSTS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState.byId).toBeDefined();
      expect(nextState.byId).not.toBe(initialState.byId);
      expect(nextState.byId).toEqual({
        1: { id: 1, title: 'Post 1' },
        2: { id: 2, title: 'Post 2' },
      });
    });

    it('adds custom API endpoint posts to dictionary', () => {
      const payload = [{
        id: 5321,
        title: 'Screencast Transcript: Improving Webpack Build Times',
        date: '2017-05-03 10:30:22',
        guid: 'https://bocoup.com/?p=5321',
      }];
      const nextState = posts({
        byId: {
          1: { id: 1, title: 'Post 1' },
          2: { id: 2, title: 'Post 2' },
        },
      }, {
        type: RECEIVE_POSTS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState.byId).toBeDefined();
      expect(nextState.byId).not.toBe(initialState.byId);
      expect(nextState.byId).toEqual({
        1: { id: 1, title: 'Post 1' },
        2: { id: 2, title: 'Post 2' },
        5321: {
          id: 5321,
          title: 'Screencast Transcript: Improving Webpack Build Times',
          date: '2017-05-03 10:30:22',
          guid: 'https://bocoup.com/?p=5321',
        },
      });
    });

    it('adds new posts to dictionary', () => {
      const payload = [
        { id: 3, title: 'Post 3' },
        { id: 4, title: 'Post 4' },
      ];
      const nextState = posts({
        byId: {
          1: { id: 1, title: 'Post 1' },
          2: { id: 2, title: 'Post 2' },
        },
      }, {
        type: RECEIVE_POSTS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState.byId).toBeDefined();
      expect(nextState.byId).not.toBe(initialState.byId);
      expect(nextState.byId).toEqual({
        1: { id: 1, title: 'Post 1' },
        2: { id: 2, title: 'Post 2' },
        3: { id: 3, title: 'Post 3' },
        4: { id: 4, title: 'Post 4' },
      });
    });

    it('updates existing posts in dictionary', () => {
      const payload = [
        { id: 2, title: 'Post 2+' },
      ];
      const nextState = posts({
        byId: {
          1: { id: 1, title: 'Post 1' },
          2: { id: 2, title: 'Post 2' },
        },
      }, {
        type: RECEIVE_POSTS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState.byId).toBeDefined();
      expect(nextState.byId).not.toBe(initialState.byId);
      expect(nextState.byId).toEqual({
        1: { id: 1, title: 'Post 1' },
        2: { id: 2, title: 'Post 2+' },
      });
    });

    it('populates the post ID order list', () => {
      const payload = [
        { id: 2, title: 'Post 2' },
        { id: 1, title: 'Post 1' },
      ];
      const nextState = posts(initialState, {
        type: RECEIVE_POSTS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState.order).toBeDefined();
      expect(nextState.order).not.toBe(initialState.order);
      expect(nextState.order).toEqual([2, 1]);
    });

    it('adds new post IDs to the post ID order list', () => {
      const payload = [
        { id: 3, title: 'Post 3' },
        { id: 4, title: 'Post 4' },
      ];
      const nextState = posts({
        order: [1, 2],
      }, {
        type: RECEIVE_POSTS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState.order).toBeDefined();
      expect(nextState.order).not.toBe(initialState.order);
      expect(nextState.order).toEqual([1, 2, 3, 4]);
    });

  });

});

describe('getPost selector', () => {
  const { getPost } = selectors;

  it('is a function', () => {
    expect(getPost).toBeDefined();
    expect(getPost).toBeInstanceOf(Function);
  });

  it('returns a post by ID', () => {
    expect(getPost({
      byId: {
        1: { id: 1, title: 'Post 1' },
        2: { id: 2, title: 'Post 2' },
      },
    }, 2)).toEqual({ id: 2, title: 'Post 2' });
  });

  it('does not mutate the data on each call', () => {
    const state = {
      byId: {
        2: { id: 2, title: 'Post 2' },
        1: { id: 1, title: 'Post 1' },
      },
    };
    expect(getPost(state, 1)).toBe(getPost(state, 1));
  });

});
