import * as api from '../api';
import * as mockObjects from './helpers/mock-api-objects';

describe('API utilities', () => {

  describe('flatten()', () => {
    const { flatten } = api;

    it('is a function', () => {
      expect(flatten).toBeDefined();
      expect(flatten).toBeInstanceOf(Function);
    });

    it('flattens the top level of a nested array', () => {
      const result = flatten([[1, 2], 3, [4], 5, [6, 7, [8]]]);
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, [8]]);
    });

  });

  describe('postId()', () => {
    const { postId } = api;

    it('is a function', () => {
      expect(postId).toBeDefined();
      expect(postId).toBeInstanceOf(Function);
    });

    it('returns a string', () => {
      expect(typeof postId(7) === 'string').toBe(true);
    });

    it('converts post IDs to string numbers', () => {
      expect(postId(7)).toBe('7');
    });

  });

  describe('termId()', () => {
    const { termId } = api;

    it('is a function', () => {
      expect(termId).toBeDefined();
      expect(termId).toBeInstanceOf(Function);
    });

    it('returns a string', () => {
      expect(typeof termId(7) === 'string').toBe(true);
    });

    it('prefixes post ID strings with "t"', () => {
      expect(termId(7)).toBe('t7');
    });

  });

  describe('resourceId()', () => {
    const { resourceId } = api;

    it('is a function', () => {
      expect(resourceId).toBeDefined();
      expect(resourceId).toBeInstanceOf(Function);
    });

    it('returns a string', () => {
      expect(typeof resourceId({ id: 7 }) === 'string').toBe(true);
    });

    it('converts post IDs to string numbers', () => {
      expect(resourceId({
        id: 7,
      })).toBe('7');
    });

    it('prefixes taxonomy IDs with "t"', () => {
      expect(resourceId({
        id: 7,
        taxonomy: 'category',
      })).toBe('t7');
    });

  });

  describe('normalizeResource()', () => {
    const { normalizeResource } = api;

    it('is a function', () => {
      expect(normalizeResource).toBeDefined();
      expect(normalizeResource).toBeInstanceOf(Function);
    });

    it('normalizes a post resource', () => {
      const { post } = mockObjects;
      const result = normalizeResource(post);
      expect(result).toEqual({
        id: '503',
        link: 'https://demo.wp-api.org/2017/03/27/testpost/',
        title: 'A Test Post',
        type: 'post',
        count: 0,
      });
    });

    it('normalizes a tag resource', () => {
      const { tag } = mockObjects;
      const result = normalizeResource(tag);
      expect(result).toEqual({
        id: 't2',
        link: 'https://demo.wp-api.org/tag/test-tag/',
        title: 'Test Tag',
        type: 'post_tag',
        count: 8,
      });
    });

    it('normalizes a category resource', () => {
      const { category } = mockObjects;
      const result = normalizeResource(category);
      expect(result).toEqual({
        id: 't7',
        link: 'https://demo.wp-api.org/category/test-category/',
        title: 'Test Category',
        type: 'category',
        count: 3,
      });
    });

  });

});
