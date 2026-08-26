import type { Metadata } from "next";
import Link from "next/link";

import styles from "./studio-development.module.css";

export const metadata: Metadata = {
  title: "Concept Studio — in development",
  description:
    "The West Coast KBP Concept Studio is being rebuilt. Configuration, comparison, saving, submissions, and property-data collection are not enabled.",
  alternates: {
    canonical: "/studio",
  },
};

const statusRows = [
  ["Surface", "Concept Studio"],
  ["Status", "In development"],
  ["Configuration", "Not enabled"],
  ["Comparison and saving", "Not enabled"],
  ["Submissions", "Not enabled"],
  ["Property data", "Not collected"],
] as const;

export default function StudioPage() {
  return (
    <main id="main-content" className={`site-main ${styles.page}`}>
      <section className={styles.surface} aria-labelledby="studio-development-title">
        <div className={`portal-container ${styles.layout}`}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Concept Studio</p>
            <h1 id="studio-development-title" className={styles.title}>
              A new design workspace is in development.
            </h1>
            <p className={styles.lede}>
              The previous technical prototype has been retired. This page does not
              currently configure, compare, save, or submit a project.
            </p>
          </div>

          <aside className={styles.placard} aria-label="Concept Studio development status">
            <div className={styles.placardHeader}>
              <p className={styles.status}>
                <span className={styles.statusPoint} aria-hidden="true" />
                System status
              </p>
              <p className={styles.reference}>STUDIO / HOLD</p>
            </div>

            <dl className={styles.matrix}>
              {statusRows.map(([label, value]) => (
                <div className={styles.row} key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </aside>

          <div className={styles.boundary}>
            <p>
              The Studio will return only after its design, interaction, and evidence
              boundaries are ready for public review.
            </p>
            <Link href="/models" className={styles.link}>
              Return to models <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
