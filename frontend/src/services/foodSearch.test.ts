/**
 * Unit tests for food search service.
 */
import { searchFoods, getFoodDetails } from './foodSearch';
import api from './api';

jest.mock('./api');

describe('Food Search Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchFoods', () => {
    it('should search for foods with query', async () => {
      const mockResults = {
        results: [
          {
            id: 'usda:171688',
            name: 'Apple, raw',
            source: 'usda',
            calories: 52,
            protein_g: 0.26,
            carbs_g: 13.81,
            fat_g: 0.17,
            serving_size: 100,
            serving_unit: 'g',
          },
        ],
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockResults });

      const result = await searchFoods('apple');

      expect(api.get).toHaveBeenCalledWith('/foods/search', {
        params: { q: 'apple', limit: 10 },
      });
      expect(result).toEqual(mockResults.results);
    });

    it('should respect custom limit parameter', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { results: [] } });

      await searchFoods('banana', 25);

      expect(api.get).toHaveBeenCalledWith('/foods/search', {
        params: { q: 'banana', limit: 25 },
      });
    });

    it('should return empty array when no results', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { results: [] } });

      const result = await searchFoods('nonexistent');

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(searchFoods('apple')).rejects.toThrow('Network error');
    });
  });

  describe('getFoodDetails', () => {
    it('should fetch food details by ID', async () => {
      const mockFood = {
        id: 'usda:171688',
        name: 'Apple, raw',
        source: 'usda',
        calories: 52,
        protein_g: 0.26,
        carbs_g: 13.81,
        fat_g: 0.17,
        serving_size: 100,
        serving_unit: 'g',
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockFood });

      const result = await getFoodDetails('usda:171688');

      expect(api.get).toHaveBeenCalledWith('/foods/usda:171688');
      expect(result).toEqual(mockFood);
    });

    it('should handle 404 errors for invalid food ID', async () => {
      (api.get as jest.Mock).mockRejectedValue({
        response: { status: 404 },
      });

      await expect(getFoodDetails('usda:999999')).rejects.toMatchObject({
        response: { status: 404 },
      });
    });
  });
});
