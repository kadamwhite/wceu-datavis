import rootReducer from '../reducers';

describe('rootReducer', () => {

  it('is a function', () => {
    expect(rootReducer).toBeDefined();
    expect(rootReducer).toBeInstanceOf(Function);
  });

  it('returns a store state object', () => {
    const state = rootReducer(undefined, {});
    expect(state).toBeDefined();
    expect(state).toBeInstanceOf(Object);
  });

  it('does not mutate the store when no action is provided', () => {
    const state = rootReducer(undefined, {});
    Object.freeze(state);
    const nextState = rootReducer(state, {});
    expect(state).toEqual(nextState);
  });

  describe('state shape', () => {

    it('returns a state object with a posts store property', () => {
      const state = rootReducer(undefined, {});
      expect(state.posts).toBeDefined();
    });

    it('returns a state object with a categories store property', () => {
      const state = rootReducer(undefined, {});
      expect(state.categories).toBeDefined();
    });

    it('returns a state object with a tags store property', () => {
      const state = rootReducer(undefined, {});
      expect(state.tags).toBeDefined();
    });

    it('returns a state object with a nodes store property', () => {
      const state = rootReducer(undefined, {});
      expect(state.nodes).toBeDefined();
    });

    it('returns a state object with a links store property', () => {
      const state = rootReducer(undefined, {});
      expect(state.links).toBeDefined();
    });

    it('returns a state object with an ID coincidence matrix store property', () => {
      const state = rootReducer(undefined, {});
      expect(state.matrix).toBeDefined();
    });

  });

});
