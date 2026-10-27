import { describe, it, expect } from 'vitest';
import { AIFreshnessService } from '../../backend/src/ai/freshness-service';

describe('AIFreshnessService Unit Tests', () => {
  it('should calculate high freshness for freshly harvested produce', () => {
    const nowIso = new Date().toISOString();
    const result = AIFreshnessService.estimateFreshness({
      cropName: 'Roma Tomatoes',
      harvestDate: nowIso,
      initialFreshness: 95.0,
      nominalShelfLifeDays: 7,
      averageTemperatureCelsius: 12.0,
    });

    expect(result.freshnessScore).toBeGreaterThanOrEqual(90);
    expect(result.grade).toBe('Grade A (Optimal)');
    expect(result.estimatedRemainingDays).toBeGreaterThan(5);
    expect(result.disclaimer).toContain('NOT constitute an accredited food-safety certification');
  });

  it('should compute accelerated degradation under elevated ambient temperatures', () => {
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const coldChainResult = AIFreshnessService.estimateFreshness({
      cropName: 'Spinach',
      harvestDate: twoDaysAgo,
      initialFreshness: 95.0,
      nominalShelfLifeDays: 4,
      averageTemperatureCelsius: 4.0, // cold chain
    });

    const warmAmbientResult = AIFreshnessService.estimateFreshness({
      cropName: 'Spinach',
      harvestDate: twoDaysAgo,
      initialFreshness: 95.0,
      nominalShelfLifeDays: 4,
      averageTemperatureCelsius: 28.0, // hot ambient
    });

    // Warm ambient exposure should degrade faster than cold chain
    expect(coldChainResult.freshnessScore).toBeGreaterThan(warmAmbientResult.freshnessScore);
    expect(coldChainResult.estimatedRemainingDays).toBeGreaterThan(warmAmbientResult.estimatedRemainingDays);
  });
});
