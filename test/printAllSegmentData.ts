import { stuttgartSegments, stuttgartSamples, mockConfig } from '../app/cruiseProfileAlgorithm.mock';

stuttgartSegments.forEach((segment, idx) => {
  console.log('==============================');
  console.log(`Segment: ${segment.segmentId}`);
  console.log(`  Latitude: ${segment.lat}`);
  console.log(`  Longitude: ${segment.long}`);
  console.log(`  Map Speed Limit (km/h): ${segment.mapSpeedLimitKmh}`);
  console.log('  Time-Dependent Limits:');
  segment.timeDependentLimits?.forEach((tdl, i) => {
    console.log(
      `    - ${tdl.limitKmh} km/h from ${tdl.fromHour}:00 to ${tdl.toHour}:00` +
      (tdl.daysOfWeek ? ` (Days: ${tdl.daysOfWeek.join(',')})` : '')
    );
  });
  console.log('  Samples:');
  stuttgartSamples[idx].forEach((sample, sidx) => {
    console.log(
      `    [${sidx + 1}] ${new Date(sample.timestamp).toLocaleString()} | Cruise Setpoint: ${sample.cruiseSetpointKmh} km/h`
    );
  });
}); 