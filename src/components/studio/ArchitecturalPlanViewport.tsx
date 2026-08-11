import Image from "next/image";

import styles from "./StudioWorkbench.module.css";

type ArchitecturalPlanViewportProps = {
  variant: "primary" | "rail";
};

export default function ArchitecturalPlanViewport({ variant }: ArchitecturalPlanViewportProps) {
  if (variant === "rail") {
    return (
      <span className={styles.planRail} aria-hidden="true">
        <span className={styles.planCrop}>
          <Image
            src="/design/a600/A600-CONCEPT-TESTFIT-001.svg"
            width={2400}
            height={3600}
            alt=""
            unoptimized
            draggable={false}
            className={styles.planSource}
          />
        </span>
      </span>
    );
  }

  return (
    <figure className={styles.planPrimary}>
      <div className={styles.planCrop}>
        <Image
          src="/design/a600/A600-CONCEPT-TESTFIT-001.svg"
          width={2400}
          height={3600}
          alt="Exact dimensioned A600 plan source crop"
          unoptimized
          draggable={false}
          className={styles.planSource}
        />
      </div>
      <figcaption>
        <span>EXACT VECTOR SOURCE</span>
        <small>SHA-256 · 54CB40A62129…</small>
      </figcaption>
    </figure>
  );
}
