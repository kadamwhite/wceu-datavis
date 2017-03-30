import messages, * as selectors from '../messages';
import * as actions from '../../actions';

describe('messages reducer', () => {

  it('is a function', () => {
    expect(messages).toBeDefined();
    expect(messages).toBeInstanceOf(Function);
  });

  it('initializes a default state object', () => {
    const state = messages(undefined, {});
    expect(state).toBeDefined();
    expect(state).toEqual([]);
  });

  it('does not mutate the state when no action is provided', () => {
    const state = messages(undefined, {});
    Object.freeze(state);
    expect(messages(state, {})).toBe(state);
  });

  const { SUBMIT_MESSAGE } = actions;
  describe(`on ${SUBMIT_MESSAGE}`, () => {

    it('Adds a message to the state', () => {
      const nextState = messages([], {
        type: SUBMIT_MESSAGE,
        payload: 'A Message',
      });
      expect(nextState).toEqual(['A Message']);
    });

  });

});

describe('getMessages selector', () => {
  const { getMessages } = selectors;

  it('is a function', () => {
    expect(messages).toBeDefined();
    expect(messages).toBeInstanceOf(Function);
  });

  it('returns the array of messages', () => {
    expect(getMessages([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('does not mutate the data on each call', () => {
    const state = [1, 2, 3];
    expect(getMessages(state)).toBe(getMessages(state));
  });

});
