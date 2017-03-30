import * as selectors from '../reducers';

describe('selectors', () => {

  describe('getMessages', () => {
    const { getMessages } = selectors;

    it('is a function', () => {
      expect(getMessages).toBeDefined();
      expect(getMessages).toBeInstanceOf(Function);
    });

    it('returns the array of messages', () => {
      expect(getMessages({
        messages: [1, 2, 3],
      })).toEqual([1, 2, 3]);
    });

    it('does not mutate the data on each call', () => {
      const state = {
        messages: [1, 2, 3],
      };
      expect(getMessages(state)).toBe(getMessages(state));
    });

  });

});
