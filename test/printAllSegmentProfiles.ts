import { stuttgartSegments, stuttgartSamples, mockConfig } from '../app/cruiseProfileAlgorithm.mock';
import { computeCruiseProfile } from '../app/cruiseProfileAlgorithm';

stuttgartSegments.forEach((segment, idx) => {
  const samples = stuttgartSamples[idx];
  const profile = computeCruiseProfile(samples, segment, mockConfig, new Date());
  console.log('==============================');
  console.log(`Segment: ${segment.segmentId}`);
  console.log(`  Chosen Speed (km/h): ${profile.chosenSpeedKmh}`);
  console.log(`  Reason: ${profile.reason}`);
  console.log(`  Computed At: ${new Date(profile.computedAt).toLocaleString()}`);
}); 