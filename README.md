# CruiseCast MVP

This project demonstrates a cruise control profile algorithm and a visual map UI for route segments, using Next.js and React.

## Features
- Computes optimal cruise speeds per road segment based on real and mock data
- Visualizes segments and cruise speeds on a Google Map
- Interactive overlays for time-of-day and segment speed profiles
- Algorithm accounts for time-dependent speed limits and outliers

## Setup & Installation

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd cruisecast-mvp
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Set Up Environment Variables
You need a Google Maps API key for the map to display. Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 4. Run the Development Server
```sh
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

## Testing the Cruise Profile Algorithm

The core algorithm is implemented in `app/cruiseProfileAlgorithm.ts`.

- Mock data for segments and samples is in `app/cruiseProfileAlgorithm.mock.ts`.
- The main UI (`app/AnimatedCarMap.tsx`) visualizes the algorithm's output.
- You can interactively test time-dependent speed limits using the "Hour of Day" slider at the bottom of the map.

### To Print Segment and Profile Data in Console

You can use the following scripts to print segment and cruise profile data to the console:

#### Print All Segment Data
Prints all segment metadata and sample data:
```sh
npx ts-node app/printAllSegmentData.ts
```

#### Print All Segment Profiles
Runs the cruise profile algorithm for each segment and prints the resulting cruise profile:
```sh
npx ts-node app/printAllSegmentProfiles.ts
```

These scripts are useful for debugging, validation, or understanding how the algorithm processes the mock data.

## Project Structure
- `app/AnimatedCarMap.tsx` — Main map UI and animation
- `app/cruiseProfileAlgorithm.ts` — Cruise profile algorithm logic
- `app/cruiseProfileAlgorithm.mock.ts` — Mock data for segments and samples
- `app/printAllSegmentData.ts` — Prints all segment and sample data to the console
- `app/printAllSegmentProfiles.ts` — Prints computed cruise profiles for all segments

## Customization
- Edit `app/cruiseProfileAlgorithm.mock.ts` to change segment locations, speed limits, or sample data.
- Adjust overlays and UI in `app/AnimatedCarMap.tsx` as needed.

## Notes
- The project uses TypeScript and Next.js (App Router).
- For production, secure your API keys and consider using a backend for real data.

---

For questions or contributions, please open an issue or pull request!
