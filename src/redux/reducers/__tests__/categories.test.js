import categories, * as selectors from '../categories';
import * as actions from '../../actions';

describe('categories reducer', () => {

  it('is a function', () => {
    expect(categories).toBeDefined();
    expect(categories).toBeInstanceOf(Function);
  });

  it('initializes a default state object', () => {
    const state = categories(undefined, {});
    expect(state).toBeDefined();
    expect(state).toEqual({
      byId: {},
      order: [],
    });
  });

  it('does not mutate the state when no action is provided', () => {
    const state = categories(undefined, {});
    Object.freeze(state);
    expect(categories(state, {})).toBe(state);
  });

  const { RECEIVE_CATEGORIES } = actions;
  describe(`on ${RECEIVE_CATEGORIES}`, () => {
    const initialState = categories(undefined, {});

    it('populates the dictionary of categories by ID', () => {
      const payload = [
        { id: 2, title: 'Category 2' },
        { id: 1, title: 'Category 1' },
      ];
      const nextState = categories(initialState, {
        type: RECEIVE_CATEGORIES,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState.byId).toBeDefined();
      expect(nextState.byId).not.toBe(initialState.byId);
      expect(nextState.byId).toEqual({
        1: { id: 1, title: 'Category 1' },
        2: { id: 2, title: 'Category 2' },
      });
    });

    it('adds new categories to dictionary', () => {
      const payload = [
        { id: 3, title: 'Category 3' },
        { id: 4, title: 'Category 4' },
      ];
      const nextState = categories({
        byId: {
          1: { id: 1, title: 'Category 1' },
          2: { id: 2, title: 'Category 2' },
        },
      }, {
        type: RECEIVE_CATEGORIES,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState.byId).toBeDefined();
      expect(nextState.byId).not.toBe(initialState.byId);
      expect(nextState.byId).toEqual({
        1: { id: 1, title: 'Category 1' },
        2: { id: 2, title: 'Category 2' },
        3: { id: 3, title: 'Category 3' },
        4: { id: 4, title: 'Category 4' },
      });
    });

    it('updates existing categories in dictionary', () => {
      const payload = [
        { id: 2, title: 'Category 2+' },
      ];
      const nextState = categories({
        byId: {
          1: { id: 1, title: 'Category 1' },
          2: { id: 2, title: 'Category 2' },
        },
      }, {
        type: RECEIVE_CATEGORIES,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState.byId).toBeDefined();
      expect(nextState.byId).not.toBe(initialState.byId);
      expect(nextState.byId).toEqual({
        1: { id: 1, title: 'Category 1' },
        2: { id: 2, title: 'Category 2+' },
      });
    });

    it('populates the category ID order list', () => {
      const payload = [
        { id: 2, title: 'Category 2' },
        { id: 1, title: 'Category 1' },
      ];
      const nextState = categories(initialState, {
        type: RECEIVE_CATEGORIES,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState.order).toBeDefined();
      expect(nextState.order).not.toBe(initialState.order);
      expect(nextState.order).toEqual([2, 1]);
    });

    it('adds new category IDs to the category ID order list', () => {
      const payload = [
        { id: 3, title: 'Category 3' },
        { id: 4, title: 'Category 4' },
      ];
      const nextState = categories({
        order: [1, 2],
      }, {
        type: RECEIVE_CATEGORIES,
        payload,
      });
      expect(nextState).not.toBe(initialState);
      expect(nextState.order).toBeDefined();
      expect(nextState.order).not.toBe(initialState.order);
      expect(nextState.order).toEqual([1, 2, 3, 4]);
    });

  });

});

describe('getCategory selector', () => {
  const { getCategory } = selectors;

  it('is a function', () => {
    expect(getCategory).toBeDefined();
    expect(getCategory).toBeInstanceOf(Function);
  });

  it('returns a category by ID', () => {
    expect(getCategory({
      byId: {
        1: { id: 1, title: 'Category 1' },
        2: { id: 2, title: 'Category 2' },
      },
    }, 2)).toEqual({ id: 2, title: 'Category 2' });
  });

  it('does not mutate the data on each call', () => {
    const state = {
      byId: {
        2: { id: 2, title: 'Category 2' },
        1: { id: 1, title: 'Category 1' },
      },
    };
    expect(getCategory(state, 1)).toBe(getCategory(state, 1));
  });

});
