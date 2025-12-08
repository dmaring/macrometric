/**
 * Unit tests for custom foods service.
 */
import {
  getCustomFoods,
  getCustomFood,
  createCustomFood,
  updateCustomFood,
  deleteCustomFood,
} from './customFoods';
import api from './api';

jest.mock('./api');

describe('Custom Foods Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCustomFoods', () => {
    it('should fetch all custom foods', async () => {
      const mockFoods = [
        {
          id: 'custom:123',
          name: 'My Recipe',
          brand: null,
          serving_size: 100,
          serving_unit: 'g',
          calories: 250,
          protein_g: 15,
          carbs_g: 30,
          fat_g: 8,
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({ data: mockFoods });

      const result = await getCustomFoods();

      expect(api.get).toHaveBeenCalledWith('/custom-foods');
      expect(result).toEqual(mockFoods);
    });
  });

  describe('getCustomFood', () => {
    it('should fetch a specific custom food', async () => {
      const mockFood = {
        id: 'custom:123',
        name: 'My Recipe',
        brand: null,
        serving_size: 100,
        serving_unit: 'g',
        calories: 250,
        protein_g: 15,
        carbs_g: 30,
        fat_g: 8,
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockFood });

      const result = await getCustomFood('123');

      expect(api.get).toHaveBeenCalledWith('/custom-foods/123');
      expect(result).toEqual(mockFood);
    });
  });

  describe('createCustomFood', () => {
    it('should create a new custom food', async () => {
      const requestData = {
        name: 'My Recipe',
        serving_size: 100,
        serving_unit: 'g',
        calories: 250,
        protein_g: 15,
        carbs_g: 30,
        fat_g: 8,
      };

      const responseData = {
        id: 'custom:123',
        ...requestData,
        brand: null,
      };

      (api.post as jest.Mock).mockResolvedValue({ data: responseData });

      const result = await createCustomFood(requestData);

      expect(api.post).toHaveBeenCalledWith('/custom-foods', requestData);
      expect(result).toEqual(responseData);
    });

    it('should create a custom food with brand', async () => {
      const requestData = {
        name: 'Protein Bar',
        brand: 'MyBrand',
        serving_size: 60,
        serving_unit: 'g',
        calories: 200,
        protein_g: 20,
        carbs_g: 15,
        fat_g: 5,
      };

      (api.post as jest.Mock).mockResolvedValue({ data: { id: 'custom:456', ...requestData } });

      const result = await createCustomFood(requestData);

      expect(api.post).toHaveBeenCalledWith('/custom-foods', requestData);
      expect(result.brand).toBe('MyBrand');
    });
  });

  describe('updateCustomFood', () => {
    it('should update a custom food', async () => {
      const updateData = {
        calories: 300,
        protein_g: 20,
      };

      const responseData = {
        id: 'custom:123',
        name: 'My Recipe',
        brand: null,
        serving_size: 100,
        serving_unit: 'g',
        calories: 300,
        protein_g: 20,
        carbs_g: 30,
        fat_g: 8,
      };

      (api.put as jest.Mock).mockResolvedValue({ data: responseData });

      const result = await updateCustomFood('123', updateData);

      expect(api.put).toHaveBeenCalledWith('/custom-foods/123', updateData);
      expect(result).toEqual(responseData);
    });
  });

  describe('deleteCustomFood', () => {
    it('should delete a custom food', async () => {
      (api.delete as jest.Mock).mockResolvedValue({ data: undefined });

      await deleteCustomFood('123');

      expect(api.delete).toHaveBeenCalledWith('/custom-foods/123');
    });
  });
});
