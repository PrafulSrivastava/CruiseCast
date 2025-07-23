import AnimatedCarMap from "./AnimatedCarMap";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>CruiseCast Demo</h1>
          <p className={styles.subtitle}>
            Visualize optimal cruise control speeds for vehicles along a city route. Adjust animation speed, inspect clustered speed profiles, and see how cruise control adapts in real time.
          </p>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.mapContainer}>
          <AnimatedCarMap />
        </div>
      </main>
      <footer className={styles.footer}>
        &copy; 2025 CruiseCast MVP &mdash; Hackathon Demo
      </footer>
    </div>
  );
}
