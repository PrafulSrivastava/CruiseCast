// Types for input data
export type CruiseSample = {
  timestamp: number; // Unix epoch ms
  segmentId: string;
  cruiseSetpointKmh: number;
  vehicleSpeedKmh?: number;
  trafficCondition?: string;
  timeOfDayBucket?: string;
};

export type SegmentMetadata = {
  segmentId: string;
  mapSpeedLimitKmh: number;
  lat: number;
  long: number;
  timeDependentLimits?: Array<{
    fromHour: number; // 0-23
    toHour: number; // 0-23
    daysOfWeek?: number[]; // 0=Sun, 6=Sat
    limitKmh: number;
  }>;
};

export type SystemConfig = {
  maxSampleAgeDays: number;
  sampleThresholdForMedian: number;
  outlierThresholdPercent: number; // e.g., 120 for 120%
};

export type CruiseProfile = {
  segmentId: string;
  chosenSpeedKmh: number;
  reason: string;
  computedAt: number;
};

// Helper: get effective speed limit for a segment at a given time
function getEffectiveSpeedLimit(
  meta: SegmentMetadata,
  at: Date
): number {
  let effectiveLimit = meta.mapSpeedLimitKmh;
  if (meta.timeDependentLimits) {
    for (const tdl of meta.timeDependentLimits) {
      const hour = at.getHours();
      const day = at.getDay();
      const inHour = hour >= tdl.fromHour && hour < tdl.toHour;
      const inDay = !tdl.daysOfWeek || tdl.daysOfWeek.includes(day);
      if (inHour && inDay) {
        effectiveLimit = Math.min(effectiveLimit, tdl.limitKmh);
      }
    }
  }
  return effectiveLimit;
}

// Helper: median
function median(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

// Main function: compute cruise profile for a segment
export function computeCruiseProfile(
  samples: CruiseSample[],
  meta: SegmentMetadata,
  config: SystemConfig,
  now: Date = new Date()
): CruiseProfile {
  // 1. Filter samples by age and outlier
  const maxAgeMs = config.maxSampleAgeDays * 24 * 60 * 60 * 1000;
  const effectiveLimit = getEffectiveSpeedLimit(meta, now);
  const outlierThreshold = (config.outlierThresholdPercent / 100) * meta.mapSpeedLimitKmh;
  const validSamples = samples.filter((s) => {
    if (now.getTime() - s.timestamp > maxAgeMs) return false;
    if (s.cruiseSetpointKmh > outlierThreshold) return false;
    // Optionally: filter by trafficCondition/timeOfDayBucket
    return true;
  });

  let chosenSpeedKmh: number;
  let reason: string;

  if (validSamples.length === 0) {
    chosenSpeedKmh = effectiveLimit;
    reason = 'No valid samples; fallback to effective speed limit';
  } else if (validSamples.length < config.sampleThresholdForMedian) {
    // Use most recent sample
    const mostRecent = validSamples.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
    chosenSpeedKmh = Math.min(mostRecent.cruiseSetpointKmh, effectiveLimit);
    reason = `Most recent of ${validSamples.length} samples (capped at effective limit)`;
  } else {
    // Use median
    const speeds = validSamples.map((s) => s.cruiseSetpointKmh);
    chosenSpeedKmh = Math.min(median(speeds), effectiveLimit);
    reason = `Median of ${validSamples.length} samples (capped at effective limit)`;
  }

  return {
    segmentId: meta.segmentId,
    chosenSpeedKmh,
    reason,
    computedAt: now.getTime(),
  };
} 