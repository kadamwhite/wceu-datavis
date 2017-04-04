import tags, * as selectors from '../tags';
import * as actions from '../../actions';

describe('tags reducer', () => {

  it('is a function', () => {
    expect(tags).toBeDefined();
    expect(tags).toBeInstanceOf(Function);
  });

  it('initializes a default state object', () => {
    const state = tags(undefined, {});
    expect(state).toBeDefined();
    expect(state).toEqual({
      byId: {},
      order: [],
    });
  });

  it('does not mutate the state when no action is provided', () => {
    const state = tags(undefined, {});
    Object.freeze(state);
    expect(tags(state, {})).toBe(state);
  });

  const { RECEIVE_TAGS } = actions;
  describe(`on ${RECEIVE_TAGS}`, () => {
    const initialState = tags(undefined, {});

    it('populates the dictionary of tags by ID', () => {
      const payload = [
        { id: 2, title: 'Tag 2' },
        { id: 1, title: 'Tag 1' },
      ];
      const nextState = tags(initialState, {
        type: RECEIVE_TAGS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState.byId).toBeDefined();
      expect(nextState.byId).not.toBe(initialState.byId);
      expect(nextState.byId).toEqual({
        1: { id: 1, title: 'Tag 1' },
        2: { id: 2, title: 'Tag 2' },
      });
    });

    it('adds new tags to dictionary', () => {
      const payload = [
        { id: 3, title: 'Tag 3' },
        { id: 4, title: 'Tag 4' },
      ];
      const nextState = tags({
        byId: {
          1: { id: 1, title: 'Tag 1' },
          2: { id: 2, title: 'Tag 2' },
        },
      }, {
        type: RECEIVE_TAGS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState.byId).toBeDefined();
      expect(nextState.byId).not.toBe(initialState.byId);
      expect(nextState.byId).toEqual({
        1: { id: 1, title: 'Tag 1' },
        2: { id: 2, title: 'Tag 2' },
        3: { id: 3, title: 'Tag 3' },
        4: { id: 4, title: 'Tag 4' },
      });
    });

    it('updates existing tags in dictionary', () => {
      const payload = [
        { id: 2, title: 'Tag 2+' },
      ];
      const nextState = tags({
        byId: {
          1: { id: 1, title: 'Tag 1' },
          2: { id: 2, title: 'Tag 2' },
        },
      }, {
        type: RECEIVE_TAGS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState.byId).toBeDefined();
      expect(nextState.byId).not.toBe(initialState.byId);
      expect(nextState.byId).toEqual({
        1: { id: 1, title: 'Tag 1' },
        2: { id: 2, title: 'Tag 2+' },
      });
    });

    it('populates the tag ID order list', () => {
      const payload = [
        { id: 2, title: 'Tag 2' },
        { id: 1, title: 'Tag 1' },
      ];
      const nextState = tags(initialState, {
        type: RECEIVE_TAGS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState.order).toBeDefined();
      expect(nextState.order).not.toBe(initialState.order);
      expect(nextState.order).toEqual([2, 1]);
    });

    it('adds new tag IDs to the tag ID order list', () => {
      const payload = [
        { id: 3, title: 'Tag 3' },
        { id: 4, title: 'Tag 4' },
      ];
      const nextState = tags({
        order: [1, 2],
      }, {
        type: RECEIVE_TAGS,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState.order).toBeDefined();
      expect(nextState.order).not.toBe(initialState.order);
      expect(nextState.order).toEqual([1, 2, 3, 4]);
    });

  });

});

describe('getTag selector', () => {
  const { getTag } = selectors;

  it('is a function', () => {
    expect(getTag).toBeDefined();
    expect(getTag).toBeInstanceOf(Function);
  });

  it('returns a tag by ID', () => {
    expect(getTag({
      byId: {
        1: { id: 1, title: 'Tag 1' },
        2: { id: 2, title: 'Tag 2' },
      },
    }, 2)).toEqual({ id: 2, title: 'Tag 2' });
  });

  it('does not mutate the data on each call', () => {
    const state = {
      byId: {
        2: { id: 2, title: 'Tag 2' },
        1: { id: 1, title: 'Tag 1' },
      },
    };
    expect(getTag(state, 1)).toBe(getTag(state, 1));
  });

});
