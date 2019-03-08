import { chunk } from './array.helpers';

describe('array helpers', () => {
  describe('chunk', () => {
    it('should work', () => {
      expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
    });

    it('should not fail if given an empty array', () => {
      expect(chunk([], 2)).toEqual([]);
    });

    it('should work when given an array with fewer elements than the desired chunk size', () => {
      expect(chunk([1, 2], 3)).toEqual([[1, 2]]);
    });

    it('should work when given an "odd" number of elements', () => {
      expect(chunk([1, 2, 3, 4], 3)).toEqual([[1, 2, 3], [4]]);
    });

    it('should return the original items in the output', () => {
      const value1 = { value: 1 };
      const value2 = { value: 2 };
      const value3 = { value: 3 };
      const value4 = { value: 4 };

      const result = chunk([value1, value2, value3, value4], 2);
      expect(result).toEqual([[value1, value2], [value3, value4]]);
      expect(result[0][0]).toBe(value1);
      expect(result[0][1]).toBe(value2);
      expect(result[1][0]).toBe(value3);
      expect(result[1][1]).toBe(value4);
    });
  });
});
