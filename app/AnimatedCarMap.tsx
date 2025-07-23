"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Polyline, Marker } from "@react-google-maps/api";
import { stuttgartSegments, stuttgartSamples, mockConfig } from "./cruiseProfileAlgorithm.mock";
import { computeCruiseProfile } from "./cruiseProfileAlgorithm";
import styles from "./AnimatedCarMap.module.css";

const center = { lat: 48.7758, lng: 9.1829 }; // Stuttgart

const containerStyle = {
  width: "100%",
  height: "60vh", // At least 60% of the viewport height
  minHeight: 400,
};

const stuttgartRoute = stuttgartSegments.map(seg => ({ lat: seg.lat, lng: seg.long }));

function getDateWithHour(hour: number) {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d;
}

export default function AnimatedCarMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  // --- Hour of day state ---
  const [hourOfDay, setHourOfDay] = useState<number | null>(null);
  useEffect(() => {
    setHourOfDay(new Date().getHours());
  }, []);

  // Compute cruise profile for each segment using the algorithm and selected hour
  const cruiseProfiles = useMemo(
    () =>
      hourOfDay !== null
        ? stuttgartSegments.map((segment, idx) =>
          computeCruiseProfile(stuttgartSamples[idx], segment, mockConfig, getDateWithHour(hourOfDay))
        )
        : [],
    [hourOfDay]
  );

  // --- ANIMATION STATE ---
  const [carIndex, setCarIndex] = useState(0);
  const [carPosition, setCarPosition] = useState(stuttgartRoute[0]);
  const [carSpeed, setCarSpeed] = useState(cruiseProfiles[0]?.chosenSpeedKmh || 50);
  const [nextSpeed, setNextSpeed] = useState(cruiseProfiles[1]?.chosenSpeedKmh || 50);
  const [speedT, setSpeedT] = useState(0); // For smooth speed transition
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const speedMultiplierRef = useRef(1);
  useEffect(() => { speedMultiplierRef.current = speedMultiplier; }, [speedMultiplier]);

  const segmentRef = useRef(0);
  const tRef = useRef(0);
  const justEnteredSegmentRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    const baseStep = 0.02;
    const interval = setInterval(() => {
      let segment = segmentRef.current;
      let t = tRef.current;
      if (segment >= stuttgartRoute.length - 1) return;
      const currentProfile = cruiseProfiles[segment];
      const nextProfile = cruiseProfiles[segment + 1] || currentProfile;
      let smoothSpeed = currentProfile.chosenSpeedKmh;
      // Smoothing logic:
      if (nextProfile.chosenSpeedKmh > currentProfile.chosenSpeedKmh) {
        if (t === 0 && segment > 0 && currentProfile.chosenSpeedKmh > cruiseProfiles[segment - 1].chosenSpeedKmh) {
          smoothSpeed = cruiseProfiles[segment - 1].chosenSpeedKmh;
        } else if (t > 0) {
          const startSpeed = cruiseProfiles[segment - 1]?.chosenSpeedKmh ?? currentProfile.chosenSpeedKmh;
          smoothSpeed = startSpeed + (currentProfile.chosenSpeedKmh - startSpeed) * t;
        }
      } else if (nextProfile.chosenSpeedKmh < currentProfile.chosenSpeedKmh) {
        smoothSpeed = currentProfile.chosenSpeedKmh + (nextProfile.chosenSpeedKmh - currentProfile.chosenSpeedKmh) * t;
      }
      setCarSpeed(smoothSpeed);
      setNextSpeed(nextProfile.chosenSpeedKmh);
      setSpeedT(t);
      const dLat = stuttgartRoute[segment + 1].lat - stuttgartRoute[segment].lat;
      const dLng = stuttgartRoute[segment + 1].lng - stuttgartRoute[segment].lng;
      const speedScale = 0.05;
      const step = baseStep * (smoothSpeed / 50) * speedScale * speedMultiplierRef.current;
      t += step;
      if (t > 1) {
        t = 0;
        segment++;
        justEnteredSegmentRef.current = false;
        if (segment >= stuttgartRoute.length - 1) {
          setCarPosition(stuttgartRoute[stuttgartRoute.length - 1]);
          setCarIndex(stuttgartRoute.length - 1);
          setCarSpeed(cruiseProfiles[cruiseProfiles.length - 1]?.chosenSpeedKmh || 50);
          segmentRef.current = segment;
          tRef.current = t;
          return;
        }
        if (cruiseProfiles[segment]?.chosenSpeedKmh > cruiseProfiles[segment - 1]?.chosenSpeedKmh) {
          justEnteredSegmentRef.current = true;
        }
      } else {
        if (justEnteredSegmentRef.current && t > 0) {
          justEnteredSegmentRef.current = false;
        }
      }
      setCarPosition({
        lat: stuttgartRoute[segment].lat + (stuttgartRoute[segment + 1].lat - stuttgartRoute[segment].lat) * t,
        lng: stuttgartRoute[segment].lng + (stuttgartRoute[segment + 1].lng - stuttgartRoute[segment].lng) * t,
      });
      setCarIndex(segment);
      segmentRef.current = segment;
      tRef.current = t;
    }, 100);
    return () => clearInterval(interval);
  }, [isLoaded, cruiseProfiles]);

  useEffect(() => {
    // Remove the style injection for .car-speed-label, now handled by CSS module
    return () => { };
  }, []);

  if (loadError) return <div>Map cannot be loaded right now.</div>;
  if (!isLoaded || hourOfDay === null) return <div>Loading Map...</div>;

  // Helper to get color based on speed
  function getSpeedColor(speed: number) {
    if (speed <= 30) return "#d50000"; // Red for low
    if (speed <= 50) return "#ffd600"; // Yellow for mid
    return "#00c853"; // Green for high
  }

  return (
    <div className={styles.layoutRow}>
      <div className={styles.mapColumn}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
        >
          <Polyline
            path={stuttgartRoute}
            options={{
              strokeColor: "#FF0000",
              strokeOpacity: 0.8,
              strokeWeight: 4,
              clickable: false,
              geodesic: true,
            }}
          />
          {/* Draw colored segments for each route segment based on cruiseProfiles */}
          {cruiseProfiles.map((profile, i) => {
            if (i === cruiseProfiles.length - 1) return null;
            const next = cruiseProfiles[i + 1];
            return (
              <Polyline
                key={i}
                path={[
                  { lat: stuttgartRoute[i].lat, lng: stuttgartRoute[i].lng },
                  { lat: stuttgartRoute[i + 1].lat, lng: stuttgartRoute[i + 1].lng },
                ]}
                options={{
                  strokeColor: getSpeedColor(profile.chosenSpeedKmh),
                  strokeOpacity: 0.9,
                  strokeWeight: 6,
                  clickable: false,
                  geodesic: true,
                }}
              />
            );
          })}
          <Marker
            position={carPosition}
            icon={{
              url: "https://maps.google.com/mapfiles/kml/shapes/cabs.png",
              scaledSize: new window.google.maps.Size(40, 40),
              labelOrigin: new window.google.maps.Point(20, -10),
            }}
            label={{
              text: `${carSpeed.toFixed(1)} km/h`,
              color: "#fff",
              fontWeight: "bold",
              fontSize: "14px",
              className: styles.carSpeedLabel,
            }}
          />
        </GoogleMap>
        <div className={styles.hourSliderRow}>
          <label htmlFor="hour-slider" className={styles.hourSliderLabel}><b>Hour of Day:</b> {hourOfDay}:00</label>
          <input
            id="hour-slider"
            type="range"
            min={0}
            max={23}
            step={1}
            value={hourOfDay}
            onChange={e => setHourOfDay(Number(e.target.value))}
            className={styles.hourSlider}
          />
        </div>
      </div>
      <div className={styles.infoColumn}>
        <div className={styles.infoBox}>
          <div><b>Current Speed:</b> {carSpeed.toFixed(1)} km/h</div>
          <div><b>Segment ID:</b> {carIndex}</div>
          <div><b>Upcoming Speed:</b> {nextSpeed.toFixed(1)} km/h</div>
          <div style={{ marginTop: 18 }}>
            <label htmlFor="speed-slider"><b>Animation Speed:</b></label>
            <input
              id="speed-slider"
              type="range"
              min={0.2}
              max={20}
              step={0.05}
              value={speedMultiplier}
              onChange={e => setSpeedMultiplier(Number(e.target.value))}
              className={styles.speedSlider}
            />
            <div className={styles.speedSliderValue}>
              {speedMultiplier.toFixed(2)}x
            </div>
          </div>
        </div>
        <div className={styles.profileBox}>
          <div className={styles.profileBoxTitle}>Segment → Cruise Speed</div>
          <table className={styles.profileTable}>
            <tbody>
              {cruiseProfiles.map((profile, i) => (
                <tr key={profile.segmentId} className={carIndex === i ? styles.profileTableRowActive : undefined}>
                  <td className={carIndex === i ? `${styles.profileTableCell} ${styles.profileTableCellActive}` : styles.profileTableCell}>
                    {profile.segmentId}
                  </td>
                  <td className={styles.profileTableCellSpeed} style={{ color: getSpeedColor(profile.chosenSpeedKmh), fontWeight: carIndex === i ? "bold" : undefined }}>
                    {profile.chosenSpeedKmh.toFixed(1)} km/h
                  </td>
                  <td className={styles.profileTableCellReason}>
                    {profile.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 