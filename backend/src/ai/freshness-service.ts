import { FreshnessEstimate } from '../types';

export class AIFreshnessService {
  /**
   * Evaluates produce batch freshness based on cultivar characteristics,
   * elapsed time since harvest, and temperature conditions.
   */
  static estimateFreshness(params: {
    cropName: string;
    harvestDate: string;
    initialFreshness?: number;
    nominalShelfLifeDays?: number;
    averageTemperatureCelsius?: number;
  }): FreshnessEstimate {
    const {
      cropName,
      harvestDate,
      initialFreshness = 95.0,
      nominalShelfLifeDays = 7,
      averageTemperatureCelsius = 15.0,
    } = params;

    const harvestMs = new Date(harvestDate).getTime();
    const nowMs = Date.now();
    const elapsedHours = Math.max(0, (nowMs - harvestMs) / (1000 * 60 * 60));

    // Temperature degradation acceleration factor (Q10 biological rate heuristic)
    // Optimal reference is ~10-12°C. Higher temperatures accelerate decay.
    let tempDegradationFactor = 1.0;
    if (averageTemperatureCelsius > 20) {
      tempDegradationFactor = 1.6;
    } else if (averageTemperatureCelsius > 15) {
      tempDegradationFactor = 1.25;
    } else if (averageTemperatureCelsius <= 5) {
      tempDegradationFactor = 0.85; // cold chain slows respiration
    }

    const totalExpectedHours = nominalShelfLifeDays * 24;
    const decayPercentage = (elapsedHours * tempDegradationFactor / totalExpectedHours) * 100;
    
    let computedScore = Math.max(0, Math.min(100, initialFreshness - decayPercentage));
    computedScore = Math.round(computedScore * 10) / 10;

    let grade: FreshnessEstimate['grade'] = 'Grade A (Optimal)';
    if (computedScore >= 85) {
      grade = 'Grade A (Optimal)';
    } else if (computedScore >= 70) {
      grade = 'Grade B (Acceptable)';
    } else if (computedScore >= 50) {
      grade = 'Grade C (Expiring Soon)';
    } else {
      grade = 'Degraded';
    }

    const remainingHours = Math.max(0, totalExpectedHours - (elapsedHours * tempDegradationFactor));
    const estimatedRemainingDays = Math.max(0, Math.round((remainingHours / 24) * 10) / 10);

    return {
      cropName,
      freshnessScore: computedScore,
      grade,
      estimatedRemainingDays,
      temperatureFactor: `${tempDegradationFactor}x decay rate (${averageTemperatureCelsius}°C avg)`,
      elapsedHours: Math.round(elapsedHours * 10) / 10,
      disclaimer: 'DISCLAIMER: This AI freshness score is a heuristic decision-support estimate based on harvest age and temperature logs. It does NOT constitute an accredited food-safety certification or laboratory microbiological clearance.',
    };
  }
}
