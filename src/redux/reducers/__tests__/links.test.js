import links from '../links';
import { RECEIVE_POSTS } from '../../actions';

describe('links reducer', () => {

  it('is a function', () => {
    expect(links).toBeDefined();
    expect(links).toBeInstanceOf(Function);
  });

  it('initializes a default state object', () => {
    const state = links(undefined, {});
    expect(state).toBeDefined();
    expect(state).toEqual([]);
  });

  it('does not mutate the state when no action is provided', () => {
    const state = links(undefined, {});
    Object.freeze(state);
    expect(links(state, {})).toBe(state);
  });

  describe(`on ${RECEIVE_POSTS}`, () => {
    const initialState = links(undefined, {});

    it('adds a well-formed link object', () => {
      const nextState = links(initialState, {
        type: RECEIVE_POSTS,
        payload: [
          { id: 1, tags: [2], categories: [] },
        ],
      });
      expect(nextState).toEqual([
        { source: '1', target: 't2', value: 1 },
      ]);
    });

    it('establishes links between posts and their taxonomy terms', () => {
      const nextState = links(initialState, {
        type: RECEIVE_POSTS,
        payload: [
          { id: 1, tags: [12], categories: [20] },
          { id: 2, tags: [11, 13], categories: [] },
          { id: 3, tags: [12], categories: [20] },
        ],
      });
      expect(nextState).toEqual([
        { source: '1', target: 't12', value: 1 },
        { source: '1', target: 't20', value: 1 },
        { source: '2', target: 't11', value: 1 },
        { source: '2', target: 't13', value: 1 },
        { source: '3', target: 't12', value: 1 },
        { source: '3', target: 't20', value: 1 },
        { source: 't11', target: 't13', value: 1 },
        { source: 't12', target: 't20', value: 2 },
      ]);
    });

    it('increments the value of existing links', () => {
      const nextState = links([
        { source: '1', target: 't12', value: 1 },
        { source: '1', target: 't20', value: 1 },
        { source: '2', target: 't11', value: 1 },
        { source: '2', target: 't13', value: 1 },
        { source: '3', target: 't12', value: 1 },
        { source: '3', target: 't20', value: 1 },
        { source: 't11', target: 't13', value: 1 },
        { source: 't12', target: 't20', value: 2 },
      ], {
        type: RECEIVE_POSTS,
        payload: [
          { id: 4, tags: [11, 13], categories: [] },
          { id: 5, tags: [11, 13], categories: [] },
        ],
      });
      expect(nextState).toEqual([
        { source: '1', target: 't12', value: 1 },
        { source: '1', target: 't20', value: 1 },
        { source: '2', target: 't11', value: 1 },
        { source: '2', target: 't13', value: 1 },
        { source: '3', target: 't12', value: 1 },
        { source: '3', target: 't20', value: 1 },
        { source: '4', target: 't11', value: 1 },
        { source: '4', target: 't13', value: 1 },
        { source: '5', target: 't11', value: 1 },
        { source: '5', target: 't13', value: 1 },
        { source: 't11', target: 't13', value: 3 },
        { source: 't12', target: 't20', value: 2 },
      ]);
    });

  });

});
