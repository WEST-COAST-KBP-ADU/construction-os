export const HOUSE_PORTAL_DESTINATION = "/studio?entry=house-portal&model=adu-a-600";
export const HOUSE_PORTAL_EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
export const HOUSE_PORTAL_DURATION_SECONDS = 1.35;
export const HOUSE_PORTAL_REDUCED_DURATION_SECONDS = 0.14;

type Target = Element | null;

type Timeline = {
  to(target: Element, vars: Record<string, unknown>, position?: number): Timeline;
};

type GsapRuntime = {
  timeline(vars: { defaults: { ease: unknown }; onComplete: () => void }): Timeline;
  registerPlugin(plugin: unknown): void;
};

export type HousePortalTransitionOptions = {
  media: Target;
  fadingControls: Target;
  reducedMotion: boolean;
  onComplete: () => void;
  onFailure: () => void;
  loadRuntime?: () => Promise<{ gsap: GsapRuntime; CustomEase: { create(name: string, ease: string): unknown } }>;
};

async function defaultRuntimeLoader() {
  const [{ gsap }, { CustomEase }] = await Promise.all([
    import("gsap"),
    import("gsap/CustomEase"),
  ]);
  return { gsap: gsap as unknown as GsapRuntime, CustomEase };
}

export async function runHousePortalTransition({
  media,
  fadingControls,
  reducedMotion,
  onComplete,
  onFailure,
  loadRuntime = defaultRuntimeLoader,
}: HousePortalTransitionOptions): Promise<void> {
  if (!media || !fadingControls) {
    onFailure();
    return;
  }

  try {
    const { gsap, CustomEase } = await loadRuntime();
    gsap.registerPlugin(CustomEase);
    const ease = CustomEase.create("housePortalEase", HOUSE_PORTAL_EASE);
    const timeline = gsap.timeline({ defaults: { ease }, onComplete });

    if (reducedMotion) {
      timeline.to(media, { opacity: 0, duration: HOUSE_PORTAL_REDUCED_DURATION_SECONDS }, 0);
      return;
    }

    timeline
      .to(fadingControls, { opacity: 0, y: 28, duration: 0.42 }, 0)
      .to(media, { scale: 1.08, x: -56, y: -18, duration: HOUSE_PORTAL_DURATION_SECONDS }, 0);
  } catch {
    onFailure();
  }
}
