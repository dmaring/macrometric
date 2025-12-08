/**
 * Unit tests for goals service.
 */
import { getGoals, setGoals, deleteGoals, skipOnboarding } from './goals';
import api from './api';

jest.mock('./api');

describe('Goals Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGoals', () => {
    it('should fetch user goals', async () => {
      const mockGoals = {
        calories: 2000,
        protein_g: 150,
        carbs_g: 250,
        fat_g: 65,
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockGoals });

      const result = await getGoals();

      expect(api.get).toHaveBeenCalledWith('/goals');
      expect(result).toEqual(mockGoals);
    });

    it('should return null when no goals set', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: null });

      const result = await getGoals();

      expect(result).toBeNull();
    });
  });

  describe('setGoals', () => {
    it('should set all goals', async () => {
      const requestData = {
        calories: 2200,
        protein_g: 160,
        carbs_g: 275,
        fat_g: 70,
      };

      const responseData = {
        calories: 2200,
        protein_g: 160,
        carbs_g: 275,
        fat_g: 70,
      };

      (api.put as jest.Mock).mockResolvedValue({ data: responseData });

      const result = await setGoals(requestData);

      expect(api.put).toHaveBeenCalledWith('/goals', requestData);
      expect(result).toEqual(responseData);
    });

    it('should set partial goals', async () => {
      const requestData = {
        calories: 1800,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
      };

      const responseData = {
        calories: 1800,
        protein_g: null,
        carbs_g: null,
        fat_g: null,
      };

      (api.put as jest.Mock).mockResolvedValue({ data: responseData });

      const result = await setGoals(requestData);

      expect(api.put).toHaveBeenCalledWith('/goals', requestData);
      expect(result).toEqual(responseData);
    });
  });

  describe('deleteGoals', () => {
    it('should delete goals', async () => {
      (api.delete as jest.Mock).mockResolvedValue({ data: undefined });

      await deleteGoals();

      expect(api.delete).toHaveBeenCalledWith('/goals');
    });
  });

  describe('skipOnboarding', () => {
    it('should skip onboarding', async () => {
      (api.post as jest.Mock).mockResolvedValue({ data: undefined });

      await skipOnboarding();

      expect(api.post).toHaveBeenCalledWith('/goals/skip-onboarding');
    });
  });
});
