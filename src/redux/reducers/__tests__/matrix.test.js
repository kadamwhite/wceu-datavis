import matrix from '../matrix';
import { RECEIVE_POSTS } from '../../actions';

describe('matrix reducer', () => {

  it('is a function', () => {
    expect(matrix).toBeDefined();
    expect(matrix).toBeInstanceOf(Function);
  });

  it('initializes a default state object', () => {
    const state = matrix(undefined, {});
    expect(state).toBeDefined();
    expect(state).toEqual({});
  });

  it('does not mutate the state when no action is provided', () => {
    const state = matrix(undefined, {});
    Object.freeze(state);
    expect(matrix(state, {})).toBe(state);
  });

  describe(`on ${RECEIVE_POSTS}`, () => {
    const initialState = matrix(undefined, {});

    it('sets matrix values to represent resource relationships', () => {
      const nextState = matrix(initialState, {
        type: RECEIVE_POSTS,
        payload: [
          { id: 5, tags: [2], categories: [] },
        ],
      });
      expect(nextState).toEqual({
        5: { t2: 1 },
      });
    });

    it('represents both post-term and term-term relationships', () => {
      const nextState = matrix(initialState, {
        type: RECEIVE_POSTS,
        payload: [
          { id: 1, tags: [12], categories: [20] },
          { id: 2, tags: [11, 13], categories: [] },
          { id: 3, tags: [12], categories: [20] },
        ],
      });
      expect(nextState).toEqual({
        1: { t12: 1, t20: 1 },
        2: { t11: 1, t13: 1 },
        3: { t12: 1, t20: 1 },
        t11: { t13: 1 },
        t12: { t20: 2 },
      });
    });

    it('increments the value of existing pairs', () => {
      const nextState = matrix({
        1: { t12: 1, t20: 1 },
        2: { t11: 1, t13: 1 },
        3: { t12: 1, t20: 1 },
        t11: { t13: 1 },
        t12: { t20: 2 },
      }, {
        type: RECEIVE_POSTS,
        payload: [
          { id: 4, tags: [11, 13], categories: [] },
          { id: 5, tags: [11, 13], categories: [] },
        ],
      });
      expect(nextState).toEqual({
        1: { t12: 1, t20: 1 },
        2: { t11: 1, t13: 1 },
        3: { t12: 1, t20: 1 },
        4: { t11: 1, t13: 1 },
        5: { t11: 1, t13: 1 },
        t11: { t13: 3 },
        t12: { t20: 2 },
      });
    });

  });

});
