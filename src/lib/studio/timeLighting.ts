export type LightingMode = "day" | "dusk" | "night";

export const AUTO_LIGHTING_REFRESH_MS = 60_000;

export function resolveLightingMode(localHour: number): LightingMode {
  if (!Number.isInteger(localHour) || localHour < 0 || localHour > 23) {
    throw new RangeError("local_hour_out_of_range");
  }

  if (localHour >= 7 && localHour < 17) return "day";
  if (localHour >= 17 && localHour < 20) return "dusk";
  return "night";
}

export function resolveDeviceLighting(now = new Date()): LightingMode {
  return resolveLightingMode(now.getHours());
}
