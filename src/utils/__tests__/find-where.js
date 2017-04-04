import findWhere from '../find-where';

describe('findWhere() utility', () => {
  const arr = [
    { title: 'A', name: 'My Name Is A', value: 7 },
    { title: 'B', name: 'My Name Is B', value: 117 },
    { title: 'C', name: 'My Name Is Actually D', value: 757 },
    { title: 'C', name: 'My Name Is C', value: 743 },
    { title: 'E', name: 'My Name Is E', value: 97 },
  ];

  it('is a function', () => {
    expect(findWhere).toBeDefined();
    expect(findWhere).toBeInstanceOf(Function);
  });

  it('returns the first item to match a provided prop-value pair', () => {
    const result = findWhere(arr, {
      title: 'B',
    });
    expect(result).toEqual({ title: 'B', name: 'My Name Is B', value: 117 });
    expect(result).toBe(arr[1]);
  });

  it('returns the first array item to match all props in the provided object', () => {
    const result = findWhere(arr, {
      title: 'C',
      value: 743,
    });
    expect(result).toEqual({ title: 'C', name: 'My Name Is C', value: 743 });
    expect(result).toBe(arr[3]);
  });

  it('returns false if no match is found', () => {
    const result = findWhere(arr, {
      title: 'A',
      value: 2501,
    });
    expect(result).toBe(false);
  });

});
