"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  HOUSE_PORTAL_DESTINATION,
  runHousePortalTransition,
} from "@/src/lib/home/housePortalMotion";

import styles from "./HousePortalHero.module.css";

export default function HousePortalHero() {
  const router = useRouter();
  const mediaRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const transitioning = useRef(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const reset = useCallback(() => {
    transitioning.current = false;
    setIsTransitioning(false);
    mediaRef.current?.removeAttribute("style");
    controlsRef.current?.removeAttribute("style");
  }, []);

  useEffect(() => {
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, [reset]);

  const openStudio = useCallback(() => {
    if (transitioning.current) return;
    transitioning.current = true;
    setIsTransitioning(true);

    const navigate = () => router.push(HOUSE_PORTAL_DESTINATION);
    void runHousePortalTransition({
      media: mediaRef.current,
      fadingControls: controlsRef.current,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      onComplete: navigate,
      onFailure: navigate,
    });
  }, [router]);

  return (
    <section className={styles.hero} aria-labelledby="house-portal-title" data-transitioning={isTransitioning}>
      <div className={styles.media} ref={mediaRef}>
        <Image
          src="/images/house-portal/property-stage-photo-master.png"
          alt="Conceptual visualization of a detached A600 ADU on a landscaped example property"
          fill
          preload
          sizes="100vw"
          className={styles.image}
        />
        <button
          className={styles.portal}
          type="button"
          onClick={openStudio}
          disabled={isTransitioning}
          aria-label="Explore the detached A600 in Studio"
        >
          <span>A600</span>
          <strong>Explore in Studio</strong>
        </button>
      </div>

      <div className={styles.editorial} ref={controlsRef}>
        <p className={styles.kicker}>A property can hold more possibility</p>
        <h1 id="house-portal-title">See what your property can become.</h1>
        <p className={styles.lede}>
          Explore an ADU concept, then continue in Studio or test it on a synthetic example lot.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/property-fit-lab">
            <strong>Explore a sample property</strong><span>Synthetic example</span>
          </Link>
          <Link className={styles.secondary} href="/models">Browse ADU models</Link>
        </div>
        <p className={styles.disclosure}>
          Conceptual visualization — not a completed West Coast KBP project or a property-specific feasibility result.
        </p>
      </div>
    </section>
  );
}
