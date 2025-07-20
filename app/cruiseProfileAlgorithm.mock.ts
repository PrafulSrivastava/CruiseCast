import { CruiseSample, SegmentMetadata, SystemConfig } from './cruiseProfileAlgorithm';

const now = Date.now();

// Stuttgart route points
const stuttgartRoute = [
  { lat: 48.7837, long: 9.1829 }, // 0: Stuttgart Hauptbahnhof
  { lat: 48.7832, long: 9.1815 }, // 1: Arnulf-Klett-Platz
  { lat: 48.7825, long: 9.1800 }, // 2: Heilbronner Straße (start)
  { lat: 48.7815, long: 9.1790 }, // 3: Heilbronner Straße (mid)
  { lat: 48.7805, long: 9.1780 }, // 4: Heilbronner Straße (end)
  { lat: 48.7795, long: 9.1770 }, // 5: Wolframstraße intersection
  { lat: 48.7785, long: 9.1760 }, // 6: Further down Heilbronner Straße
];

// Generate one segment per route point with dramatic time-dependent limits
export const stuttgartSegments: SegmentMetadata[] = stuttgartRoute.map((pt, idx) => ({
  segmentId: `SEG${idx + 1}`,
  mapSpeedLimitKmh: idx === 0 ? 30 : idx < 3 ? 50 : idx < 5 ? 60 : 80, // Example: lower at start, higher at end
  lat: pt.lat,
  long: pt.long,
  timeDependentLimits: [
    // Each segment has two or more dramatic time-dependent limits
    idx === 0
      ? { fromHour: 7, toHour: 10, limitKmh: 15, daysOfWeek: [1,2,3,4,5] } // School zone, very low
      : idx === 1
      ? { fromHour: 6, toHour: 9, limitKmh: 25 } // Early morning low
      : idx === 2
      ? { fromHour: 17, toHour: 20, limitKmh: 35 } // Evening rush
      : idx === 3
      ? { fromHour: 12, toHour: 14, limitKmh: 40 } // Lunch time
      : idx === 4
      ? { fromHour: 8, toHour: 11, limitKmh: 30 } // Morning
      : idx === 5
      ? { fromHour: 18, toHour: 22, limitKmh: 50 } // Evening
      : { fromHour: 22, toHour: 6, limitKmh: 20 }, // Night, very low
    // Add a high limit for other hours for contrast
    idx === 0
      ? { fromHour: 10, toHour: 24, limitKmh: 45 }
      : idx === 1
      ? { fromHour: 9, toHour: 18, limitKmh: 60 }
      : idx === 2
      ? { fromHour: 6, toHour: 17, limitKmh: 70 }
      : idx === 3
      ? { fromHour: 0, toHour: 12, limitKmh: 65 }
      : idx === 4
      ? { fromHour: 11, toHour: 24, limitKmh: 80 }
      : idx === 5
      ? { fromHour: 0, toHour: 18, limitKmh: 75 }
      : { fromHour: 6, toHour: 22, limitKmh: 90 },
  ],
}));

// Generate high-variance samples for each segment
export const stuttgartSamples: CruiseSample[][] = stuttgartSegments.map((seg, idx) => {
  const base = seg.mapSpeedLimitKmh;
  return [
    { timestamp: now - 1000 * 60 * 60 * 1, segmentId: seg.segmentId, cruiseSetpointKmh: base - 10 + Math.floor(Math.random() * 5) },
    { timestamp: now - 1000 * 60 * 60 * 2, segmentId: seg.segmentId, cruiseSetpointKmh: base + 5 + Math.floor(Math.random() * 10) },
    { timestamp: now - 1000 * 60 * 60 * 3, segmentId: seg.segmentId, cruiseSetpointKmh: base - 5 + Math.floor(Math.random() * 10) },
    { timestamp: now - 1000 * 60 * 60 * 4, segmentId: seg.segmentId, cruiseSetpointKmh: base + 15 }, // outlier
    { timestamp: now - 1000 * 60 * 60 * 5, segmentId: seg.segmentId, cruiseSetpointKmh: base },
    { timestamp: now - 1000 * 60 * 60 * 6, segmentId: seg.segmentId, cruiseSetpointKmh: base + 2 },
    { timestamp: now - 1000 * 60 * 60 * 7, segmentId: seg.segmentId, cruiseSetpointKmh: base - 7 },
    { timestamp: now - 1000 * 60 * 60 * 8, segmentId: seg.segmentId, cruiseSetpointKmh: base + 8 },
  ];
});

export const mockConfig: SystemConfig = {
  maxSampleAgeDays: 30,
  sampleThresholdForMedian: 8,
  outlierThresholdPercent: 120,
}; 