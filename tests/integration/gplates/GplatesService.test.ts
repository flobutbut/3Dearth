import { describe, it, expect, beforeEach } from 'vitest';
import { GplatesService } from '../../../src/services/gplates/GplatesService';

describe('GplatesService Integration Tests', () => {
  let gplatesService: GplatesService;

  beforeEach(() => {
    gplatesService = new GplatesService();
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      expect(gplatesService).toBeDefined();
    });
  });

  describe('Data Loading', () => {
    it('should load plate data for a specific time period', async () => {
      const startTime = -250; // 250 Ma
      const endTime = 0; // Present
      const result = await gplatesService.loadPlateData(startTime, endTime);
      expect(result).toBeDefined();
    });

    it('should handle invalid time periods', async () => {
      const startTime = 100; // Future time
      const endTime = 200;
      await expect(gplatesService.loadPlateData(startTime, endTime))
        .rejects
        .toThrow('Invalid time period');
    });
  });

  describe('Data Processing', () => {
    it('should process plate boundaries correctly', async () => {
      const time = -100; // 100 Ma
      const boundaries = await gplatesService.getPlateBoundaries(time);
      expect(boundaries).toBeDefined();
      expect(Array.isArray(boundaries)).toBe(true);
    });

    it('should calculate plate velocities', async () => {
      const time = -50; // 50 Ma
      const velocities = await gplatesService.getPlateVelocities(time);
      expect(velocities).toBeDefined();
      expect(typeof velocities).toBe('object');
    });
  });
}); 